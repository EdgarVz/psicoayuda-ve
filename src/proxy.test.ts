import { describe, it, expect } from 'vitest'
import { buildCspString } from './proxy'

const testDirectives = [
  { directive: 'default-src', sources: ["'self'"] },
  { directive: 'script-src', sources: ["'self'", '${nonce}', 'https://js.sentry-cdn.com'] },
  { directive: 'style-src', sources: ["'self'", "'unsafe-inline'"] },
  { directive: 'img-src', sources: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'] },
  { directive: 'font-src', sources: ["'self'"] },
  { directive: 'connect-src', sources: ["'self'", 'https://*.supabase.co', 'https://*.ingest.sentry.io'] },
  { directive: 'frame-ancestors', sources: ["'none'"] },
]

describe('buildCspString', () => {
  it('includes default-src self', () => {
    const result = buildCspString(testDirectives, 'abc123')
    expect(result).toContain("default-src 'self'")
  })

  it('includes script-src with nonce and sentry', () => {
    const result = buildCspString(testDirectives, 'abc123')
    expect(result).toContain("script-src 'self' 'nonce-abc123' https://js.sentry-cdn.com")
  })

  it('includes connect-src with supabase and sentry ingest', () => {
    const result = buildCspString(testDirectives, 'abc123')
    expect(result).toContain("connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io")
  })

  it('includes style-src with unsafe-inline', () => {
    const result = buildCspString(testDirectives, 'abc123')
    expect(result).toContain("style-src 'self' 'unsafe-inline'")
  })

  it('includes frame-ancestors none', () => {
    const result = buildCspString(testDirectives, 'abc123')
    expect(result).toContain("frame-ancestors 'none'")
  })

  it('uses the provided nonce', () => {
    const result = buildCspString(testDirectives, 'xyz789')
    expect(result).toContain("'nonce-xyz789'")
  })

  it('joins directives with semicolon and space', () => {
    const result = buildCspString(testDirectives, 'abc123')
    const parts = result.split('; ')
    expect(parts.length).toBe(testDirectives.length)
  })
})
