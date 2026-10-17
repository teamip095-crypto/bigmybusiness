import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for AUTH operations (anon key — safe for server-side
 * auth flows like resetPasswordForEmail + updateUser).
 * Used by the admin forgot-password (email) flow.
 */
export function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/**
 * Get the site URL for auth redirect (production Vercel URL).
 */
export function getSiteUrl() {
  return "https://bigmybusiness-teamip095-9998s-projects.vercel.app";
}
