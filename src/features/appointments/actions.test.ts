import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitRequest, acceptRequest, rejectRequest } from './actions'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createServerSupabase } from '@/lib/supabase/server'
import type { AppointmentRequestInput } from './schemas'

function createMockUser(id = 'user-123') {
  return { id, email: 'test@example.com' }
}

function mockSupabase(user: { id: string } | null = createMockUser()) {
  const mockGetUser = vi.fn()
  mockGetUser.mockResolvedValue({
    data: { user },
    error: user ? null : new Error('No session'),
  })

  const mockSingle = vi.fn()

  const mockSelect = vi.fn(() => ({ single: mockSingle }))

  const mockInsert = vi.fn(() => ({ select: mockSelect }))

  const mockEq2 = vi.fn().mockResolvedValue({ error: null })

  const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))

  const mockUpdate = vi.fn(() => ({ eq: mockEq1 }))

  vi.mocked(createServerSupabase).mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect,
      eq: mockEq1,
      single: mockSingle,
    })),
  } as never)

  return { mockGetUser, mockInsert, mockUpdate, mockSelect, mockSingle, mockEq1, mockEq2 }
}

const baseInput: AppointmentRequestInput = {
  psychologist_id: '123e4567-e89b-12d3-a456-426614174000',
  patient_age: 30,
  reason: ['ansiedad'],
  consent_granted: true,
}

describe('submitRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns id on successful submission', async () => {
    const { mockSingle } = mockSupabase()
    mockSingle.mockResolvedValue({ data: { id: 'req-123' }, error: null })

    const result = await submitRequest(baseInput)

    expect(result).toEqual({ data: { id: 'req-123' } })
  })

  it('returns auth error when user is not logged in', async () => {
    mockSupabase(null)

    const result = await submitRequest(baseInput)

    expect(result).toEqual({ error: 'Debes iniciar sesión para solicitar una cita' })
  })

  it('returns validation error for invalid input', async () => {
    mockSupabase()

    const result = await submitRequest({
      ...baseInput,
      patient_age: 5,
    })

    expect(result).toHaveProperty('error')
  })

  it('returns error on insert failure', async () => {
    const { mockSingle } = mockSupabase()
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })

    const result = await submitRequest(baseInput)

    expect(result).toEqual({ error: 'Error al enviar la solicitud. Intenta de nuevo.' })
  })
})

describe('acceptRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success on accept', async () => {
    mockSupabase()

    const result = await acceptRequest('req-123')

    expect(result).toEqual({})
  })

  it('returns auth error when not logged in', async () => {
    mockSupabase(null)

    const result = await acceptRequest('req-123')

    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })
})

describe('rejectRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success on reject', async () => {
    mockSupabase()

    const result = await rejectRequest('req-123')

    expect(result).toEqual({})
  })

  it('returns auth error when not logged in', async () => {
    mockSupabase(null)

    const result = await rejectRequest('req-123')

    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })
})