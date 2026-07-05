import type { Metadata } from 'next'
import { getPsychologists } from '@/features/catalog/queries'
import { CatalogClient } from './catalog-client'

export const metadata: Metadata = {
  title: 'Psicólogos disponibles',
  description: 'Encuentra psicólogos voluntarios verificados en Venezuela por especialidad',
}

export default async function PsicologosPage({
  searchParams,
}: {
  searchParams: Promise<{ specialties?: string; available?: string }>
}) {
  const params = await searchParams
  const specialties = params.specialties ? params.specialties.split(',') : undefined
  const isAvailable = params.available === 'true' ? true : params.available === 'false' ? false : undefined

  const psychologists = await getPsychologists({ specialties, isAvailable })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Psicólogos disponibles</h1>
      <p className="text-muted-foreground mb-8">Selecciona una especialidad para filtrar</p>

      <CatalogClient initialPsychologists={psychologists} initialSpecialties={specialties ?? []} />
    </div>
  )
}
