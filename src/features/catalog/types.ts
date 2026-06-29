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
