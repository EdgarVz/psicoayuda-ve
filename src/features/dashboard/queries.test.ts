import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

import { createServerSupabase } from '@/lib/supabase/server'
import { getPatientRequests, getPsychologistRequests, getPatientStats, getPsychologistStats } from './queries'

function mockPatientData() {
  const mockOrder = vi.fn().mockResolvedValue({
    data: [
      {
        id: 'req-1',
        status: 'pending',
        reason: ['ansiedad'],
        created_at: '2026-06-29T12:00:00Z',
        psychologist_id: 'psy-1',
        psychologist_profiles: {
          whatsapp_link: null,
          profiles: { display_name: 'Dra. María' },
        },
      },
      {
        id: 'req-2',
        status: 'accepted',
        reason: ['duelo'],
        created_at: '2026-06-28T12:00:00Z',
        psychologist_id: 'psy-2',
        psychologist_profiles: {
          whatsapp_link: 'https://wa.me/584141234567',
          profiles: { display_name: 'Dr. José' },
        },
      },
    ],
    error: null,
  })

  const mockEq = vi.fn(() => ({ order: mockOrder }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  vi.mocked(createServerSupabase).mockResolvedValue({ from: mockFrom } as never)
}

function mockPsychologistData() {
  const mockOrder = vi.fn().mockResolvedValue({
    data: [
      {
        id: 'req-1',
        status: 'pending',
        reason: ['ansiedad'],
        patient_age: 30,
        created_at: '2026-06-29T12:00:00Z',
        profiles: { display_name: 'Paciente A' },
      },
    ],
    error: null,
  })

  const mockEq = vi.fn(() => ({ order: mockOrder }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  vi.mocked(createServerSupabase).mockResolvedValue({ from: mockFrom } as never)
}

describe('getPatientRequests', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns mapped patient requests', async () => {
    mockPatientData()
    const result = await getPatientRequests('user-123')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'req-1', psychologistName: 'Dra. María', status: 'pending', reason: ['ansiedad'], whatsappLink: null })
  })

  it('hides whatsapp link for pending, shows for accepted', async () => {
    mockPatientData()
    const result = await getPatientRequests('user-123')

    expect(result[0].whatsappLink).toBeNull()
    expect(result[1].whatsappLink).toBe('https://wa.me/584141234567')
  })
})

describe('getPsychologistRequests', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns mapped psychologist requests', async () => {
    mockPsychologistData()
    const result = await getPsychologistRequests('psy-123')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'req-1', patientName: 'Paciente A', patientAge: 30, status: 'pending' })
  })
})

describe('getPatientStats', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('computes stats from patient requests', async () => {
    mockPatientData()
    const stats = await getPatientStats('user-123')

    expect(stats).toEqual({ total: 2, pending: 1, accepted: 1, rejected: 0 })
  })
})

describe('getPsychologistStats', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('computes stats from psychologist requests', async () => {
    mockPsychologistData()
    const stats = await getPsychologistStats('psy-123')

    expect(stats).toEqual({ total: 1, pending: 1, accepted: 0, rejected: 0 })
  })
})