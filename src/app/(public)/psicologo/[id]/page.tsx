import type { Metadata } from 'next'
import { getPsychologistById } from '@/features/psychologist/queries'
import { PsychologistProfile } from '@/features/psychologist/components/psychologist-profile'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const psychologist = await getPsychologistById(id)

  const description =
    psychologist.biography ??
    `Psicólogo especializado en ${psychologist.specialties.join(', ')}`

  return {
    title: `${psychologist.fullName} — Psicólogo`,
    description,
  }
}

export default async function PsychologistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const psychologist = await getPsychologistById(id)

  return <PsychologistProfile psychologist={psychologist} />
}
