import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PsychologistRegistrationInput } from './schemas'

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

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabase: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn() } },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

function makeGoodChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.select = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)
  chain.insert = vi.fn().mockResolvedValue({ error: null })
  chain.eq = vi.fn().mockResolvedValue({ error: null })
  return chain
}

function makeFailChain(failOn: 'update' | 'insert') {
  const chain = makeGoodChain()
  if (failOn === 'update') {
    chain.eq = vi.fn().mockResolvedValue({ error: new Error('DB error') })
  } else {
    chain.insert = vi.fn().mockResolvedValue({ error: new Error('DB error') })
  }
  return chain
}

const validInput: PsychologistRegistrationInput = {
  fullName: 'María García',
  licenseNumber: '12345',
  specialties: ['ansiedad'],
  languages: ['español'],
  whatsappLink: 'https://wa.me/584141234567',
  consentGranted: true,
}

describe('registerPsychologist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()
    mockFrom.mockReturnValue(makeGoodChain())
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { registerPsychologist } = await import('./actions')
    const result = await registerPsychologist(validInput)
    expect(result).toEqual({ error: 'Debes iniciar sesión para registrarte como psicólogo' })
  })

  it('returns error when input is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { registerPsychologist } = await import('./actions')
    const result = await registerPsychologist({ ...validInput, fullName: 'A' })
    expect(result.error).toBeDefined()
  })

  it('succeeds for authenticated user with valid input', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { registerPsychologist } = await import('./actions')
    const result = await registerPsychologist(validInput)
    expect(result).toEqual({})
  })

  it('returns error when profile update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValueOnce(makeFailChain('update')).mockReturnValueOnce(makeGoodChain())
    const { registerPsychologist } = await import('./actions')
    const result = await registerPsychologist(validInput)
    expect(result).toEqual({ error: 'Error al actualizar el perfil' })
  })

  it('returns error when insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValueOnce(makeGoodChain()).mockReturnValueOnce(makeFailChain('insert'))
    const { registerPsychologist } = await import('./actions')
    const result = await registerPsychologist(validInput)
    expect(result).toEqual({ error: 'Error al crear el perfil de psicólogo. El número de colegiatura podría ya estar registrado.' })
  })
})