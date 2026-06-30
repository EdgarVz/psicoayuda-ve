import { describe, it, expect } from 'vitest'
import { psychologistRegistrationSchema } from './schemas'

describe('psychologistRegistrationSchema', () => {
  const valid = {
    full_name: 'María García',
    license_number: '12345',
    specialties: ['ansiedad'],
    consent_verified: true as const,
  }

  it('accepts valid data', () => {
    expect(psychologistRegistrationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects short full_name', () => {
    expect(psychologistRegistrationSchema.safeParse({ ...valid, full_name: 'A' }).success).toBe(false)
  })

  it('rejects empty specialties', () => {
    expect(psychologistRegistrationSchema.safeParse({ ...valid, specialties: [] }).success).toBe(false)
  })

  it('rejects consent_verified false', () => {
    expect(psychologistRegistrationSchema.safeParse({ ...valid, consent_verified: false }).success).toBe(false)
  })

  it('rejects empty license_number', () => {
    expect(psychologistRegistrationSchema.safeParse({ ...valid, license_number: '' }).success).toBe(false)
  })
})
