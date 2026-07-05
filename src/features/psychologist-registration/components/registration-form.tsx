'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerPsychologist, checkExistingProfile } from '@/features/psychologist-registration/actions'
import type { PsychologistRegistrationInput } from '@/features/psychologist-registration/schemas'
import { SPECIALTY_LABELS } from '@/lib/specialties'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface RegistrationFormProps {
  userLoggedIn?: boolean
}

export function RegistrationForm({ userLoggedIn = false }: RegistrationFormProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>('idle')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  useEffect(() => {
    if (!userLoggedIn) return
    checkExistingProfile().then((result) => {
      if (result.exists) {
        setAlreadyRegistered(true)
      }
    })
  }, [userLoggedIn, router])
  const [errorMessage, setErrorMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [biography, setBiography] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [availabilityHours, setAvailabilityHours] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [consent, setConsent] = useState(false)

  const isValid =
    fullName.length >= 3 &&
    licenseNumber.length >= 4 &&
    selectedSpecialties.length > 0 &&
    whatsappLink.startsWith('https://wa.me/') &&
    biography.length >= 10 &&
    selectedLanguages.length > 0 &&
    selectedDays.length > 0 &&
    availabilityHours.length > 0 &&
    consent

  function toggleLanguage(value: string) {
    setSelectedLanguages((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    )
  }

  function toggleDay(value: string) {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    )
  }

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
      languages: selectedLanguages,
      whatsappLink,
      biography,
      availabilityDays: selectedDays,
      availabilityHours,
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

  if (alreadyRegistered) {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏳</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Ya estás registrado</h2>
        <p className="text-muted-foreground mb-6">
          Ya enviaste tu solicitud de registro como psicólogo. Está pendiente de verificación por el equipo administrativo.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary text-white px-6 py-3 rounded-radius-button hover:opacity-90 transition-opacity"
        >
          Ir al dashboard
        </button>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Registro completado</h2>
        <p className="text-muted-foreground">
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
        <p className="text-xs text-muted-foreground mt-1">Usa el formato wa.me seguido de tu número con código de país</p>
      </div>

      <div>
        <label htmlFor="biography" className="block text-sm font-medium mb-1">
          Sobre ti
        </label>
        <textarea
          id="biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
          placeholder="Cuéntanos sobre tu experiencia, enfoque terapéutico y motivación para unirte"
          required
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          Idiomas de atención
        </legend>
        <div className="flex flex-wrap gap-2">
          {['español', 'inglés', 'portugués', 'francés'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selectedLanguages.includes(lang)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border hover:border-primary/50 text-muted-foreground'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          Disponibilidad
        </legend>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Lunes', value: 'monday' },
              { label: 'Martes', value: 'tuesday' },
              { label: 'Miércoles', value: 'wednesday' },
              { label: 'Jueves', value: 'thursday' },
              { label: 'Viernes', value: 'friday' },
              { label: 'Sábado', value: 'saturday' },
            ].map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  selectedDays.includes(day.value)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={availabilityHours}
            onChange={(e) => setAvailabilityHours(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: 9:00 - 15:00"
            required
          />
        </div>
      </fieldset>

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
                  : 'bg-white border-border hover:border-primary/50 text-muted-foreground'
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
          <span className="text-sm text-muted-foreground">
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
        className={`w-full py-3 rounded-radius-button font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${state === 'submitting' ? 'opacity-70 animate-pulse' : ''}`}
        style={{ backgroundColor: '#2B7A6E' }}
      >
        {state === 'submitting' ? 'Registrando...' : 'Registrarme como psicólogo'}
      </button>
    </form>
  )
}