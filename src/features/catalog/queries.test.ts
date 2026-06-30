import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

import { createServerSupabase } from '@/lib/supabase/server'
import { getPsychologists, getHomePsychologists } from './queries'

function createSupabaseMock(data: unknown[], error: Error | null = null) {
  const mockOrder = vi.fn().mockResolvedValue({ data, error })

  const queryBuilder = {
    eq: vi.fn(() => queryBuilder),
    overlaps: vi.fn(() => queryBuilder),
    order: mockOrder,
  }

  const mockSelect = vi.fn(() => queryBuilder)
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  vi.mocked(createServerSupabase).mockResolvedValue({ from: mockFrom } as never)

  return { mockFrom, mockSelect, mockOrder, queryBuilder }
}

describe('getPsychologists', () => {
  it('returns mapped psychologist cards', async () => {
    createSupabaseMock([
      {
        id: 'psy-1',
        display_name: 'María García',
        avatar_url: null,
        psychologist_profiles: {
          specialties: ['ansiedad', 'duelo'],
          languages: ['español'],
          is_available: true,
        },
      },
    ])

    const result = await getPsychologists()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'psy-1',
      displayName: 'María García',
      specialties: ['ansiedad', 'duelo'],
      languages: ['español'],
      isAvailable: true,
    })
  })

  it('returns empty array on error', async () => {
    createSupabaseMock([], new Error('DB error'))
    const result = await getPsychologists()
    expect(result).toEqual([])
  })

  it('filters by availability when provided', async () => {
    const { queryBuilder } = createSupabaseMock([])
    await getPsychologists({ isAvailable: true })
    expect(queryBuilder.eq).toHaveBeenCalledWith('psychologist_profiles.is_available', true)
  })

  it('filters by specialties when provided', async () => {
    const { queryBuilder } = createSupabaseMock([])
    await getPsychologists({ specialties: ['ansiedad'] })
    expect(queryBuilder.overlaps).toHaveBeenCalledWith('psychologist_profiles.specialties', ['ansiedad'])
  })

  it('calls order with foreignTable', async () => {
    const { mockOrder } = createSupabaseMock([])
    await getPsychologists()
    expect(mockOrder).toHaveBeenCalledWith('is_available', { foreignTable: 'psychologist_profiles', ascending: false })
  })
})

describe('getHomePsychologists', () => {
  it('returns at most 6 available psychologists', async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `psy-${i}`,
      display_name: `Psy ${i}`,
      avatar_url: null,
      psychologist_profiles: {
        specialties: ['ansiedad'],
        languages: ['español'],
        is_available: true,
      },
    }))

    createSupabaseMock(items)
    const result = await getHomePsychologists()
    expect(result).toHaveLength(6)
  })

  it('returns fewer when not enough psychologists', async () => {
    createSupabaseMock([
      {
        id: 'psy-1',
        display_name: 'Solo',
        avatar_url: null,
        psychologist_profiles: {
          specialties: [],
          languages: ['español'],
          is_available: true,
        },
      },
    ])

    const result = await getHomePsychologists()
    expect(result).toHaveLength(1)
  })
})
