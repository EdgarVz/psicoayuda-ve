import { createServerSupabase } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { PsychologistCardData, PsychologistFilters } from './types'

interface CatalogPsychologistProfile {
  specialties: string[]
  languages: string[]
  is_available: boolean
}

export async function getPsychologists(filters?: PsychologistFilters): Promise<PsychologistCardData[]> {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      psychologist_profiles!inner (
        specialties,
        languages,
        is_available
      )
    `)
    .eq('role', 'psychologist')
    .eq('psychologist_profiles.license_verified', true)

  if (filters?.isAvailable !== undefined) {
    query = query.eq('psychologist_profiles.is_available', filters.isAvailable)
  }

  if (filters?.specialties && filters.specialties.length > 0) {
    query = query.overlaps('psychologist_profiles.specialties', filters.specialties)
  }

  const { data, error } = await query.order('is_available', { foreignTable: 'psychologist_profiles', ascending: false })

  if (error) {
    logger.error('Error fetching psychologists', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    specialties: (row.psychologist_profiles as unknown as CatalogPsychologistProfile).specialties ?? [],
    languages: (row.psychologist_profiles as unknown as CatalogPsychologistProfile).languages ?? [],
    isAvailable: (row.psychologist_profiles as unknown as CatalogPsychologistProfile).is_available ?? false,
  }))
}

export async function getHomePsychologists(): Promise<PsychologistCardData[]> {
  return getPsychologists({ isAvailable: true }).then(psychologists => psychologists.slice(0, 6))
}
