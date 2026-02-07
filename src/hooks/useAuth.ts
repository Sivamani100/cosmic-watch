import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/asteroid';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, profile: data as unknown as Profile }));
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));

      // Defer profile fetch with setTimeout to avoid deadlock
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setState((prev) => ({ ...prev, profile: null }));
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter' | string) => {
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
    });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updates as any)
      .eq('id', state.user.id)
      .select()
      .single();

    if (error) throw error;
    setState((prev) => ({ ...prev, profile: data as unknown as Profile }));
    return data;
  };

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: !!state.user,
    login,
    signInWithProvider,
    register,
    logout,
    updateProfile,
  };
}
