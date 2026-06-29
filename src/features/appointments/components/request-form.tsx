'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitRequest } from '@/features/appointments/actions'
import type { AppointmentRequestInput } from '@/features/appointments/schemas'

const specialtyLabels: Record<string, string> = {
  duelo: 'Duelo',
  ansiedad: 'Ansiedad',
  crisis_panico: 'Crisis de pánico',
  trauma: 'Trauma',
  apoyo_ninos: 'Apoyo para niños',
  apoyo_adolescentes: 'Apoyo para adolescentes',
  depresion: 'Depresión',
  estres: 'Estrés',
  violencia: 'Violencia',
  adicciones: 'Adicciones',
}

interface RequestFormProps {
  psychologistId: string
  psychologistName: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function RequestForm({ psychologistId, psychologistName }: RequestFormProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [age, setAge] = useState('')
  const [reasons, setReasons] = useState<string[]>([])
  const [preferredSchedule, setPreferredSchedule] = useState('')
  const [consent, setConsent] = useState(false)

  const isValid = consent && reasons.length > 0 && age !== ''

  function toggleReason(specialty: string) {
    setReasons((prev) =>
      prev.includes(specialty)
        ? prev.filter((r) => r !== specialty)
        : [...prev, specialty]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setState('submitting')
    setErrorMessage('')

    const input: AppointmentRequestInput = {
      psychologist_id: psychologistId,
      patient_age: Number(age),
      reason: reasons as AppointmentRequestInput['reason'],
      preferred_schedule: preferredSchedule || undefined,
      consent_granted: true,
    }

    const result = await submitRequest(input)

    if ('error' in result) {
      setState('error')
      setErrorMessage(result.error)
      return
    }

    setState('success')
    router.push(`/solicitud/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Solicitando cita con <strong>{psychologistName}</strong>
      </p>

      <div>
        <label htmlFor="age" className="block text-sm font-medium mb-1">
          Tu edad
        </label>
        <input
          id="age"
          type="number"
          min={10}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ingresa tu edad"
          required
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          ¿Cuál es el motivo de tu solicitud?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(specialtyLabels).map(([value, label]) => (
            <label
              key={value}
              className={`flex items-center gap-2 px-3 py-2 border rounded-radius-input text-sm cursor-pointer transition-colors ${
                reasons.includes(value)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={reasons.includes(value)}
                onChange={() => toggleReason(value)}
                className="accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="schedule" className="block text-sm font-medium mb-1">
          Horario preferido (opcional)
        </label>
        <textarea
          id="schedule"
          value={preferredSchedule}
          onChange={(e) => setPreferredSchedule(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          placeholder="Ej: Prefiero horario de mañana, los fines de semana..."
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-primary"
        />
        <span className="text-sm text-muted">
          Acepto que mi información sea compartida con el psicólogo para procesar
          esta solicitud de cita. Entiendo que mis datos serán tratados de forma
          confidencial.
        </span>
      </label>

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
        {state === 'submitting' ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
