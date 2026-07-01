'use server'

import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rate-limit'
import { magicLinkSchema, type MagicLinkInput } from './schemas'
import { env } from '@/lib/env'

async function sendMagicLinkImpl(input: MagicLinkInput): Promise<{ success?: true; error?: string }> {
  const parsed = magicLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createServerSupabase()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? env.NEXT_PUBLIC_SITE_URL

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/dashboard`,
    },
  })

  if (error) {
    return { error: 'Error al enviar el enlace. Intenta de nuevo.' }
  }

  return { success: true }
}

export const sendMagicLink = withRateLimit(sendMagicLinkImpl, {
  limit: 3,
  windowMs: 60000,
  keyFn: (input: MagicLinkInput) => `magic-link:${input.email}`,
})

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
}
