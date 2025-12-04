/**
 * Supabase Admin Client - Server-side configuration
 * Untuk digunakan di Next.js API Routes dan Server Components
 * Menggunakan service_role key (private key) - JANGAN expose ke client!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Check if environment variables are configured
const hasValidConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Use placeholder values during build time when env vars are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING-SERVICE-ROLE-KEY-SET-ENV-VAR';

// Warn when environment variables are missing during development
if (!hasValidConfig && process.env.NODE_ENV === 'development') {
  console.warn(
    'Missing Supabase environment variables. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

/**
 * Admin client dengan service_role key
 * Ini bypasskan RLS (Row Level Security) policies
 * Gunakan HANYA di backend/API routes, JANGAN di client components!
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: SupabaseClient<any, 'public', any> = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Helper function untuk hash password dengan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
