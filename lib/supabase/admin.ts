import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

/**
 * Supabase admin client for server-side operations
 * Uses service role key - BYPASSES RLS
 * ONLY use in:
 * - Inngest functions
 * - Admin operations
 * - Webhook handlers
 * - Background jobs
 *
 * NEVER expose to client side
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
