import { env } from '@/lib/env'

interface LogPayload {
  message: string
  data?: Record<string, unknown>
  error?: unknown
}

const isSentryEnabled = !!env.SENTRY_DSN

async function logToSentry(level: string, payload: LogPayload) {
  if (!isSentryEnabled) return
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureMessage(payload.message, { level: level as 'info' | 'warning' | 'error', extra: payload.data })
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    logToSentry('info', { message, data })
  },
  warn(message: string, data?: Record<string, unknown>) {
    logToSentry('warning', { message, data })
  },
  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    console.error(message, error, data)
    logToSentry('error', { message, data, error })
  },
}
