import { describe, it, expect } from 'vitest'
import { magicLinkSchema, psychologistSignupSchema } from './schemas'

describe('magicLinkSchema', () => {
  it('accepts valid email', () => {
    expect(magicLinkSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(magicLinkSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects empty email', () => {
    expect(magicLinkSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('psychologistSignupSchema', () => {
  it('accepts valid data', () => {
    const result = psychologistSignupSchema.safeParse({
      email: 'psych@example.com',
      display_name: 'Dr. Pérez',
      full_name: 'Juan Pérez',
      license_number: 'VEN-12345',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short display_name', () => {
    const result = psychologistSignupSchema.safeParse({
      email: 'psych@example.com',
      display_name: 'A',
      full_name: 'Juan Pérez',
      license_number: 'VEN-12345',
    })
    expect(result.success).toBe(false)
  })
})
