import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export interface PsychologistDetail {
  id: string
  displayName: string
  fullName: string
  avatarUrl: string | null
  biography: string | null
  specialties: string[]
  languages: string[]
  isAvailable: boolean
  availability: Record<string, unknown> | null
  licenseVerified: boolean
  licenseNumber: string
  yearsExperience: number | null
}

interface PsychologistProfileRow {
  full_name: string
  biography: string | null
  specialties: string[]
  languages: string[]
  is_available: boolean
  availability: Record<string, unknown> | null
  license_verified: boolean
  license_number: string
  years_experience: number | null
}

export async function getPsychologistById(id: string): Promise<PsychologistDetail> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      psychologist_profiles!inner (
        full_name,
        biography,
        specialties,
        languages,
        is_available,
        availability,
        license_verified,
        license_number,
        years_experience
      )
    `)
    .eq('id', id)
    .eq('role', 'psychologist')
    .single()

  if (error || !data) {
    notFound()
  }

  const profile = data.psychologist_profiles as unknown as PsychologistProfileRow

  return {
    id: data.id,
    displayName: data.display_name,
    fullName: profile.full_name,
    avatarUrl: data.avatar_url,
    biography: profile.biography,
    specialties: profile.specialties ?? [],
    languages: profile.languages ?? [],
    isAvailable: profile.is_available ?? false,
    availability: profile.availability,
    licenseVerified: profile.license_verified ?? false,
    licenseNumber: profile.license_number,
    yearsExperience: profile.years_experience ?? null,
  }
}
