import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export async function getResendClient() {
  if (!env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY no configurada — emails no enviados')
    console.warn('RESEND_API_KEY no configurada — emails no enviados')
    return null
  }

  const { Resend } = await import('resend')
  return new Resend(env.RESEND_API_KEY)
}
