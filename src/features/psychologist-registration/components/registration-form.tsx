'use client'

import { useState } from 'react'
import { registerPsychologist } from '@/features/psychologist-registration/actions'
import { psychologistRegistrationSchema } from '@/features/psychologist-registration/schemas'
import { SPECIALTY_LABELS } from '@/lib/specialties'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function RegistrationForm() {
  const [fullName, setFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = psychologistRegistrationSchema.safeParse({
      full_name: fullName,
      license_number: licenseNumber,
      specialties: selectedSpecialties,
      consent_verified: consent ? (true as const) : (false as const),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }

    setState('submitting')

    const result = await registerPsychologist(parsed.data)

    if (result.error) {
      setError(result.error)
      setState('error')
      return
    }

    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="text-center p-8 bg-background-alt rounded-radius-card">
        <p className="text-lg font-medium mb-2">Registro completado</p>
        <p className="text-muted">Bienvenido a PsicoAyuda VE</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-lg font-medium text-center mb-2">Completa tu registro</p>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          disabled={state === 'submitting'}
          className="w-full px-4 py-3 rounded-radius-button border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
          Número de colegiatura
        </label>
        <input
          id="licenseNumber"
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="Ej: VEN-12345"
          disabled={state === 'submitting'}
          className="w-full px-4 py-3 rounded-radius-button border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2">Especialidades</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SPECIALTY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSpecialty(key)}
              disabled={state === 'submitting'}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedSpecialties.includes(key)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background-alt text-muted-foreground border-border hover:border-primary'
              } disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={state === 'submitting'}
          className="mt-1"
        />
        <span className="text-sm text-muted-foreground">
          Acepto los términos de consentimiento
        </span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full bg-primary text-white py-3 rounded-radius-button font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        {state === 'submitting' ? 'Registrando...' : 'Completar registro'}
      </button>
    </form>
  )
}
