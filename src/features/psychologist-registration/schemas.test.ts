import { describe, it, expect } from 'vitest'
import { psychologistRegistrationSchema } from './schemas'

const validInput = {
  fullName: 'María García',
  licenseNumber: '12345',
  specialties: ['ansiedad'],
  languages: ['español'],
  whatsappLink: 'https://wa.me/584141234567',
  consentGranted: true as const,
}

describe('psychologistRegistrationSchema', () => {
  it('accepts valid data', () => {
    const result = psychologistRegistrationSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts valid data with multiple specialties', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      specialties: ['ansiedad', 'depresion', 'trauma'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects short fullName', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      fullName: 'A',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres')
    }
  })

  it('rejects short licenseNumber', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      licenseNumber: 'AB',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un número de colegiatura válido')
    }
  })

  it('rejects empty specialties', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      specialties: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Selecciona al menos una especialidad')
    }
  })

  it('rejects invalid specialty', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      specialties: ['invalid_specialty'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid whatsappLink format', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      whatsappLink: 'https://example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Debe ser un enlace de wa.me válido')
    }
  })

  it('rejects consentGranted false', () => {
    const result = psychologistRegistrationSchema.safeParse({
      ...validInput,
      consentGranted: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Debes aceptar los términos de consentimiento')
    }
  })

  it('defaults languages to español', () => {
    const { fullName, licenseNumber, specialties, whatsappLink, consentGranted } = validInput
    const result = psychologistRegistrationSchema.safeParse({
      fullName, licenseNumber, specialties, whatsappLink, consentGranted,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.languages).toEqual(['español'])
    }
  })
})