import type { NotificationType } from './types'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

const mockInsert = vi.fn()
const mockEq2 = vi.fn().mockResolvedValue({ error: null })
const mockIs2 = vi.fn().mockResolvedValue({ error: null })
const mockEq1 = vi.fn(() => ({ eq: mockEq2, is: mockIs2 }))
const mockUpdate = vi.fn(() => ({ eq: mockEq1 }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
    },
    from: vi.fn(() => ({
      update: mockUpdate,
      eq: mockEq1,
    })),
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createNotification', () => {
  it('inserts notification with valid input', async () => {
    mockInsert.mockResolvedValue({ error: null })
    const { createNotification } = await import('./actions')

    await createNotification({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
      related_id: null,
    })
  })

  it('includes relatedId when provided', async () => {
    mockInsert.mockResolvedValue({ error: null })
    const { createNotification } = await import('./actions')

    await createNotification({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
      relatedId: '660e8400-e29b-41d4-a716-446655440000',
    })

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
      related_id: '660e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('handles insert error gracefully', async () => {
    mockInsert.mockResolvedValue({ error: new Error('DB error') })
    const { createNotification } = await import('./actions')

    await expect(createNotification({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
    })).resolves.toBeUndefined()
  })

  it('handles invalid input gracefully', async () => {
    const { createNotification } = await import('./actions')

    await expect(createNotification({
      userId: 'bad-id',
      type: 'request_accepted' as unknown as NotificationType,
      title: '',
      body: '',
    })).resolves.toBeUndefined()
  })
})

describe('markAsRead', () => {
  it('marks notification as read', async () => {
    mockEq2.mockResolvedValue({ error: null })
    const { markAsRead } = await import('./actions')

    const result = await markAsRead('notif-1')
    expect(result).toEqual({})
  })

  it('returns error when update fails', async () => {
    mockEq2.mockResolvedValue({ error: new Error('DB error') })
    const { markAsRead } = await import('./actions')

    const result = await markAsRead('notif-1')
    expect(result).toHaveProperty('error')
  })
})

describe('markAllAsRead', () => {
  it('marks all notifications as read', async () => {
    mockIs2.mockResolvedValue({ error: null })
    const { markAllAsRead } = await import('./actions')

    const result = await markAllAsRead()
    expect(result).toEqual({})
  })
})
