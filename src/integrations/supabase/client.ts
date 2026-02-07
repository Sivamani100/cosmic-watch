import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// If env vars are missing, log a clear error and export a safe dummy
let _supabase: any = null;
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    "CRITICAL: Supabase environment variables are missing! \n" +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env or provider dashboard (e.g., Vercel)."
  );

  // Minimal dummy that surface clear errors if used in production without envs.
  const throwMissing = async () => {
    throw new Error('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  };

  _supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: throwMissing,
      signUp: throwMissing,
      signOut: throwMissing,
    },
    from: () => ({
      select: throwMissing,
      insert: throwMissing,
      update: throwMissing,
      eq: () => ({ select: throwMissing }),
    }),
    // basic rpc placeholder
    rpc: throwMissing,
  } as any;
} else {
  _supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
}

export const supabase = _supabase;