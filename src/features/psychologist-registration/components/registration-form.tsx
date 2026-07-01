'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerPsychologist } from '@/features/psychologist-registration/actions'
import type { PsychologistRegistrationInput } from '@/features/psychologist-registration/schemas'
import { SPECIALTY_LABELS } from '@/lib/specialties'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function RegistrationForm() {
  const router = useRouter()
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [consent, setConsent] = useState(false)

  const isValid =
    fullName.length >= 3 &&
    licenseNumber.length >= 4 &&
    selectedSpecialties.length > 0 &&
    whatsappLink.startsWith('https://wa.me/') &&
    consent

  function toggleSpecialty(value: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setState('submitting')
    setErrorMessage('')

    const result = await registerPsychologist({
      fullName,
      licenseNumber,
      specialties: selectedSpecialties as PsychologistRegistrationInput['specialties'],
      languages: ['español'],
      whatsappLink,
      consentGranted: true as const,
    })

    if (result.error) {
      setState('error')
      setErrorMessage(result.error)
      return
    }

    setState('success')
    router.push('/dashboard')
  }

  if (state === 'success') {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Registro completado</h2>
        <p className="text-muted">
          Bienvenido a PsicoAyuda VE. Tu perfil está pendiente de verificación por el equipo administrativo.
          Te notificaremos cuando sea aprobado.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tu nombre completo"
          required
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
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ej: 12345"
          required
        />
      </div>

      <div>
        <label htmlFor="whatsappLink" className="block text-sm font-medium mb-1">
          Enlace de WhatsApp
        </label>
        <input
          id="whatsappLink"
          type="url"
          value={whatsappLink}
          onChange={(e) => setWhatsappLink(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://wa.me/584141234567"
          required
        />
        <p className="text-xs text-muted mt-1">Usa el formato wa.me seguido de tu número con código de país</p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          Especialidades
        </legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleSpecialty(value)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selectedSpecialties.includes(value)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border hover:border-primary/50 text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="bg-[#FAF6F1] rounded-radius-card p-6">
        <label htmlFor="consent-checkbox" className="flex items-start gap-3 cursor-pointer">
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span className="text-sm text-muted">
            Certifico que soy un profesional de la salud mental habilitado y acepto los términos de la plataforma.
          </span>
        </label>
      </div>

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-radius-input">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || state === 'submitting'}
        className="w-full py-3 rounded-radius-button font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#2B7A6E' }}
      >
        {state === 'submitting' ? 'Registrando...' : 'Registrarme como psicólogo'}
      </button>
    </form>
  )
}