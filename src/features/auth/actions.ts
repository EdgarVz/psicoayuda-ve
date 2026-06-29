'use server'

import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { magicLinkSchema, type MagicLinkInput } from './schemas'
import { env } from '@/lib/env'

export async function sendMagicLink(input: MagicLinkInput): Promise<{ success?: true; error?: string }> {
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

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
}
