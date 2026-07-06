'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PsychologistCardData } from '@/features/catalog/types'
import { SpecialtyFilter } from '@/features/catalog/components/specialty-filter'
import { PsychologistList } from '@/features/catalog/components/psychologist-list'

interface CatalogClientProps {
  initialPsychologists: PsychologistCardData[]
  initialSpecialties: string[]
}

export function CatalogClient({ initialPsychologists, initialSpecialties }: CatalogClientProps) {
  const router = useRouter()
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialSpecialties)

  function handleSpecialtyChange(specialties: string[]) {
    setSelectedSpecialties(specialties)
    const params = new URLSearchParams()
    if (specialties.length > 0) params.set('specialties', specialties.join(','))
    router.push(`/psicologos?${params.toString()}`)
  }

  return (
    <>
      <SpecialtyFilter selected={selectedSpecialties} onChange={handleSpecialtyChange} />
      <div className="mt-6">
        <PsychologistList psychologists={initialPsychologists} />
      </div>
    </>
  )
}
