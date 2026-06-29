'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { PsychologistCardData } from '@/features/catalog/types'

export function PsychologistCard({ psychologist }: { psychologist: PsychologistCardData }) {
  return (
    <div className="bg-white rounded-radius-card border border-border p-4 flex gap-4 items-start">
      <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-background-alt">
        {psychologist.avatarUrl ? (
          <Image src={psychologist.avatarUrl} alt={psychologist.displayName} fill unoptimized className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-muted">
            {psychologist.displayName.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">{psychologist.displayName}</h3>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {psychologist.specialties.map((s) => (
            <span key={s} className="text-xs bg-background-alt text-muted-foreground px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className={`w-2 h-2 rounded-full ${psychologist.isAvailable ? 'bg-available' : 'bg-unavailable'}`} />
          <span className="text-sm text-muted">
            {psychologist.isAvailable ? 'Disponible ahora' : 'No disponible'}
          </span>
        </div>

        <Link
          href={`/psicologo/${psychologist.id}`}
          className={`mt-3 inline-block text-sm px-4 py-2 rounded-radius-button font-medium transition-colors ${
            psychologist.isAvailable
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-unavailable/20 text-muted cursor-not-allowed pointer-events-none'
          }`}
        >
          {psychologist.isAvailable ? 'Conectar' : 'No disponible temporalmente'}
        </Link>
      </div>
    </div>
  )
}

export function PsychologistCardSkeleton() {
  return (
    <div className="bg-white rounded-radius-card border border-border p-4 flex gap-4 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-background-alt flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-background-alt rounded w-2/3" />
        <div className="h-4 bg-background-alt rounded w-1/3" />
        <div className="h-4 bg-background-alt rounded w-1/4" />
      </div>
    </div>
  )
}
