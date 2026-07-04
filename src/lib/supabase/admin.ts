import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export function createAdminSupabase() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
