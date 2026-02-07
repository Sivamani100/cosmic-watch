-- Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  alert_preferences JSONB DEFAULT '{"email_alerts":true,"push_alerts":false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asteroids cache table
CREATE TABLE public.asteroids_cache (
  neo_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nasa_jpl_url TEXT,
  absolute_magnitude REAL,
  diameter_min_km REAL,
  diameter_max_km REAL,
  is_potentially_hazardous BOOLEAN DEFAULT false,
  close_approach_data JSONB,
  orbital_data JSONB,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  last_fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asteroids_hazardous ON public.asteroids_cache(is_potentially_hazardous);
CREATE INDEX idx_asteroids_risk ON public.asteroids_cache(risk_level);
CREATE INDEX idx_asteroids_name ON public.asteroids_cache(name);
ALTER TABLE public.asteroids_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read asteroids" ON public.asteroids_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert asteroids" ON public.asteroids_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update asteroids" ON public.asteroids_cache FOR UPDATE TO authenticated USING (true);

-- Watched asteroids table
CREATE TABLE public.watched_asteroids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  neo_id TEXT REFERENCES public.asteroids_cache(neo_id) ON DELETE CASCADE NOT NULL,
  alert_enabled BOOLEAN DEFAULT true,
  min_distance_threshold_km REAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, neo_id)
);

CREATE INDEX idx_watched_user ON public.watched_asteroids(user_id);
ALTER TABLE public.watched_asteroids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watched" ON public.watched_asteroids FOR ALL USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  neo_id TEXT REFERENCES public.asteroids_cache(neo_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('close_approach','new_hazardous','threshold_breach','custom')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  neo_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_neo ON public.chat_messages(neo_id, created_at DESC);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read chat" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated send chat" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_asteroids_updated_at BEFORE UPDATE ON public.asteroids_cache FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_watched_updated_at BEFORE UPDATE ON public.watched_asteroids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();