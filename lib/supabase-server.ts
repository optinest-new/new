import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseServerEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseServerClient(accessToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}
