/**
 * ============================================================
 * VAANIFLOW — SUPABASE DATABASE & CLIENT CONFIGURATION
 * Real-time Database and Service Connection Layer
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Health check & validation for Supabase connectivity
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      reason: 'SUPABASE_URL or SUPABASE_KEY is not defined in environment variables.',
    };
  }

  try {
    // Attempt a lightweight probe on the public schema
    const { data, error } = await supabase.from('conversations').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet before migrations, check general api response
      return {
        connected: true,
        tablesReady: false,
        message: `Connected to Supabase, table check notice: ${error.message}`,
      };
    }

    return {
      connected: true,
      tablesReady: true,
      message: 'Supabase client connected successfully.',
    };
  } catch (err) {
    return {
      connected: false,
      reason: err.message,
    };
  }
}

export default {
  supabase,
  isSupabaseConfigured,
  testSupabaseConnection,
};
