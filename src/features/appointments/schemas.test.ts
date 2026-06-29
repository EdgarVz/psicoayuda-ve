import { describe, it, expect } from 'vitest'
import { appointmentRequestSchema } from './schemas'

const validInput = {
  psychologist_id: '123e4567-e89b-12d3-a456-426614174000',
  patient_age: 25,
  reason: ['ansiedad'],
  consent_granted: true as const,
}

describe('appointmentRequestSchema', () => {
  it('accepts valid data', () => {
    const result = appointmentRequestSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts valid data with preferred_schedule', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      preferred_schedule: 'Por las mañanas',
    })
    expect(result.success).toBe(true)
  })

  it('rejects age below 10', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      patient_age: 9,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La edad mínima es 10 años')
    }
  })

  it('rejects age above 120', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      patient_age: 121,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Edad inválida')
    }
  })

  it('rejects empty reason', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      reason: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Selecciona al menos un motivo')
    }
  })

  it('rejects consent_granted = false', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      consent_granted: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Debes aceptar los términos de consentimiento')
    }
  })

  it('rejects invalid specialty', () => {
    const result = appointmentRequestSchema.safeParse({
      ...validInput,
      reason: ['invalid_specialty'],
    })
    expect(result.success).toBe(false)
  })
})
