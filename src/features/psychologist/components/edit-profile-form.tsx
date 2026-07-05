'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updatePsychologistProfile } from '@/features/psychologist/actions'
import type { PsychologistProfileUpdateInput } from '@/features/psychologist/schemas'
import { SPECIALTY_LABELS } from '@/lib/specialties'

interface EditProfileFormProps {
  initialData: {
    fullName: string
    biography: string | null
    specialties: string[]
    languages: string[]
    whatsappLink: string | null
    isAvailable: boolean
    yearsExperience: number | null
  }
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fullName, setFullName] = useState(initialData.fullName)
  const [biography, setBiography] = useState(initialData.biography ?? '')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialData.specialties)
  const [languages, setLanguages] = useState(initialData.languages.join(', '))
  const [whatsappLink, setWhatsappLink] = useState(initialData.whatsappLink ?? '')
  const [isAvailable, setIsAvailable] = useState(initialData.isAvailable)
  const [yearsExperience, setYearsExperience] = useState(initialData.yearsExperience?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input: PsychologistProfileUpdateInput = {
      fullName,
      biography: biography || undefined,
      specialties: selectedSpecialties,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      whatsappLink: whatsappLink || undefined,
      isAvailable,
      yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
    }

    const result = await updatePsychologistProfile(input)

    if ('error' in result && result.error) {
      setError(result.error)
      toast.error(result.error)
    } else {
      toast.success('Perfil actualizado correctamente')
      router.refresh()
    }

    setIsSubmitting(false)
  }

  function toggleSpecialty(specialtyId: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((s) => s !== specialtyId)
        : [...prev, specialtyId],
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-radius-input">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div>
        <label htmlFor="biography" className="block text-sm font-medium mb-1">
          Biografía
        </label>
        <textarea
          id="biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Especialidades</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SPECIALTY_LABELS).map(([id, label]) => {
            const isSelected = selectedSpecialties.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleSpecialty(id)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="languages" className="block text-sm font-medium mb-1">
          Idiomas (separados por coma)
        </label>
        <input
          id="languages"
          type="text"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="español, inglés"
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div>
        <label htmlFor="whatsappLink" className="block text-sm font-medium mb-1">
          Enlace de WhatsApp
        </label>
        <input
          id="whatsappLink"
          type="text"
          value={whatsappLink}
          onChange={(e) => setWhatsappLink(e.target.value)}
          placeholder="https://wa.me/584141234567"
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isAvailable"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="isAvailable" className="text-sm font-medium">
          Disponible para recibir solicitudes
        </label>
      </div>

      <div>
        <label htmlFor="yearsExperience" className="block text-sm font-medium mb-1">
          Años de experiencia
        </label>
        <input
          id="yearsExperience"
          type="number"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          min={0}
          max={70}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-radius-button font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#2B7A6E' }}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
