import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type PsychologistRow = Database['public']['Tables']['psychologist_profiles']['Row']

export interface PsychologistCardData {
  id: string
  displayName: string
  avatarUrl: string | null
  specialties: string[]
  languages: string[]
  isAvailable: boolean
}

export interface PsychologistFilters {
  specialties?: string[]
  isAvailable?: boolean
}
