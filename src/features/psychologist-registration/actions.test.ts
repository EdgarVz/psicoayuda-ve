import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: {
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    RESEND_API_KEY: undefined,
    SENTRY_DSN: undefined,
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabase: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { registerPsychologist } from './actions'

const validInput = {
  full_name: 'María García',
  license_number: '12345',
  specialties: ['ansiedad'],
  consent_verified: true as const,
}

function mockAuthenticatedUser() {
  vi.mocked(createServerSupabase).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
    },
  } as never)
}

function mockAdminSupabase(mockFrom: ReturnType<typeof vi.fn>) {
  vi.mocked(createAdminSupabase).mockReturnValue({ from: mockFrom } as never)
}

describe('registerPsychologist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as never)

    const result = await registerPsychologist(validInput)

    expect(result).toEqual({ error: 'Debes iniciar sesión para registrarte como psicólogo' })
  })

  it('returns validation error for invalid input', async () => {
    mockAuthenticatedUser()

    const result = await registerPsychologist({ ...validInput, full_name: 'A' })

    expect(result).toHaveProperty('error')
  })

  it('updates role to psychologist and inserts profile on success', async () => {
    mockAuthenticatedUser()

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn(() => ({ eq: mockEq }))
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    const mockFrom = vi.fn((table: string) => {
      if (table === 'profiles') return { update: mockUpdate }
      if (table === 'psychologist_profiles') return { insert: mockInsert }
      return {}
    })

    mockAdminSupabase(mockFrom)

    const result = await registerPsychologist(validInput)

    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledWith({ role: 'psychologist', display_name: 'María García' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-123',
      full_name: 'María García',
      license_number: '12345',
      specialties: ['ansiedad'],
      is_available: false,
    })
  })

  it('returns error when profile update fails', async () => {
    mockAuthenticatedUser()

    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }) })
    const mockFrom = vi.fn(() => ({ update: mockUpdate }))

    mockAdminSupabase(mockFrom)

    const result = await registerPsychologist(validInput)

    expect(result).toEqual({ error: 'Error al actualizar tu perfil' })
  })

  it('reverts role change when psychologist_profiles insert fails', async () => {
    mockAuthenticatedUser()

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn(() => ({ eq: mockEq }))
    const mockInsert = vi.fn().mockResolvedValue({ error: new Error('Insert failed') })
    const mockFrom = vi.fn((table: string) => {
      if (table === 'profiles') return { update: mockUpdate }
      if (table === 'psychologist_profiles') return { insert: mockInsert }
      return {}
    })

    mockAdminSupabase(mockFrom)

    const result = await registerPsychologist(validInput)

    expect(result).toEqual({ error: 'Error al crear tu perfil de psicólogo' })
    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenNthCalledWith(1, { role: 'psychologist', display_name: 'María García' })
    expect(mockUpdate).toHaveBeenNthCalledWith(2, { role: 'patient' })
  })
})
