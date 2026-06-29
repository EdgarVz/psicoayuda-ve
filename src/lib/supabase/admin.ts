import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export function createAdminSupabase() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    logger.warn('SUPABASE_SERVICE_ROLE_KEY not set — admin client unavailable')
    return null
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
