import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'logos-auth-token',
    storage: window.localStorage,
  },
});

// Helper function to get the current session's access token
export const getAccessToken = async () => {
  // First try to get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    return session.access_token;
  }
  
  // Don't try to refresh if there's no session, just throw the error
  throw new Error("No valid session found");
}; 