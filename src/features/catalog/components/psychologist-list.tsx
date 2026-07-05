'use client'

import type { PsychologistCardData } from '@/features/catalog/types'
import { PsychologistCard, PsychologistCardSkeleton } from './psychologist-card'

interface PsychologistListProps {
  psychologists: PsychologistCardData[]
  isLoading?: boolean
}

export function PsychologistList({ psychologists, isLoading }: PsychologistListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PsychologistCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (psychologists.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No hay psicólogos disponibles en este momento</p>
        <p className="text-sm text-muted-foreground-light mt-1">Vuelve a consultar más tarde</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {psychologists.map((psychologist) => (
        <PsychologistCard key={psychologist.id} psychologist={psychologist} />
      ))}
    </div>
  )
}
