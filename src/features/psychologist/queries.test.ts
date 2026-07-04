import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))

import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPsychologistById } from './queries'

function mockSuccess(data: unknown) {
  const mockSingle = vi.fn().mockResolvedValue({ data, error: null })
  const mockEq2 = vi.fn(() => ({ single: mockSingle }))
  const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
  const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  vi.mocked(createServerSupabase).mockResolvedValue({ from: mockFrom } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPsychologistById', () => {
  it('returns mapped psychologist data', async () => {
    mockSuccess({
      id: 'psy-1',
      display_name: 'María García',
      avatar_url: null,
      psychologist_profiles: {
        full_name: 'María García López',
        biography: 'Soy psicóloga clínica',
        specialties: ['ansiedad', 'duelo'],
        languages: ['español', 'inglés'],
        is_available: true,
        availability: { monday: ['09:00-12:00'] },
        license_verified: true,
        license_number: 'COL-12345',
        years_experience: 8,
      },
    })

    const result = await getPsychologistById('psy-1')

    expect(result).toMatchObject({
      id: 'psy-1',
      displayName: 'María García',
      fullName: 'María García López',
      specialties: ['ansiedad', 'duelo'],
      languages: ['español', 'inglés'],
      licenseVerified: true,
      licenseNumber: 'COL-12345',
    })
  })

  it('returns yearsExperience when present', async () => {
    mockSuccess({
      id: 'psy-2',
      display_name: 'Juan Pérez',
      avatar_url: null,
      psychologist_profiles: {
        full_name: 'Juan Pérez',
        biography: null,
        specialties: [],
        languages: [],
        is_available: true,
        availability: null,
        license_verified: true,
        license_number: 'COL-67890',
        years_experience: 12,
      },
    })

    const result = await getPsychologistById('psy-2')

    expect(result.yearsExperience).toBe(12)
  })

  it('falls back to empty arrays for null specialties and languages', async () => {
    mockSuccess({
      id: 'psy-3',
      display_name: 'Ana Silva',
      avatar_url: null,
      psychologist_profiles: {
        full_name: 'Ana Silva',
        biography: null,
        specialties: null,
        languages: null,
        is_available: false,
        availability: null,
        license_verified: false,
        license_number: '',
        years_experience: null,
      },
    })

    const result = await getPsychologistById('psy-3')

    expect(result.specialties).toEqual([])
    expect(result.languages).toEqual([])
  })

  it('calls notFound() when query returns an error', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
    const mockEq2 = vi.fn(() => ({ single: mockSingle }))
    const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
    const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
    const mockFrom = vi.fn(() => ({ select: mockSelect }))

    vi.mocked(createServerSupabase).mockResolvedValue({ from: mockFrom } as never)

    await expect(getPsychologistById('psych-error')).rejects.toThrow('NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it('calls notFound() when data is null', async () => {
    mockSuccess(null)

    await expect(getPsychologistById('psych-null')).rejects.toThrow('NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
