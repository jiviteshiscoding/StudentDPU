import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Public Supabase client configuration.
 *
 * Security Rules:
 * - Only publishable / anon public keys are read here via Vite env.
 * - Never read, import, or log service-role keys or bot tokens in frontend code.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

/**
 * Validates that the provided URL looks like a plausible HTTP/HTTPS URL.
 */
function isValidUrl(urlString?: string): boolean {
  if (!urlString) return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Configuration status check.
 * Evaluates whether safe public client credentials are provided and well-formed.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes('YOUR_PROJECT_REF')
);

/**
 * Singleton Supabase browser client instance.
 *
 * If credentials are not configured or are malformed:
 * - Does not crash the application.
 * - Returns `null` so the app gracefully operates in existing demo mode.
 */
export const supabase: SupabaseClient | null = (() => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    return createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    // Report only that client instantiation failed without logging sensitive values
    console.warn('[PROJEX] Supabase browser client initialization error. Running in local demo mode.');
    return null;
  }
})();
