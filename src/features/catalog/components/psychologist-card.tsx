'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { PsychologistCardData } from '@/features/catalog/types'

export function PsychologistCard({ psychologist }: { psychologist: PsychologistCardData }) {
  return (
    <div className="bg-white rounded-radius-card border border-border p-4 flex flex-col items-center text-center">
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-background-alt">
        {psychologist.avatarUrl ? (
          <Image src={psychologist.avatarUrl} alt={psychologist.displayName} fill unoptimized className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            👩‍⚕️
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg mt-2 truncate max-w-full">{psychologist.displayName}</h3>

      <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
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
        {psychologist.isAvailable ? `Conectar con ${psychologist.displayName}` : 'No disponible temporalmente'}
      </Link>
    </div>
  )
}

export function PsychologistCardSkeleton() {
  return (
    <div className="bg-white rounded-radius-card border border-border p-4 flex flex-col items-center text-center animate-pulse">
      <div className="w-14 h-14 rounded-full bg-background-alt" />
      <div className="space-y-3 mt-3 w-full">
        <div className="h-5 bg-background-alt rounded w-2/3 mx-auto" />
        <div className="h-4 bg-background-alt rounded w-1/3 mx-auto" />
        <div className="h-4 bg-background-alt rounded w-1/4 mx-auto" />
      </div>
    </div>
  )
}
