-- Create community_messages table
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    CONSTRAINT message_length CHECK (char_length(message) <= 2000)
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Community messages are viewable by everyone" 
ON public.community_messages FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert community messages" 
ON public.community_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community messages" 
ON public.community_messages FOR DELETE 
USING (auth.uid() = user_id);

-- Enable Realtime for community_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
