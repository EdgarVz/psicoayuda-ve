import { env } from '@/lib/env'

export function getResendClient() {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada — emails no enviados')
    return null
  }

  const { Resend } = await import('resend')
  return new Resend(env.RESEND_API_KEY)
}
