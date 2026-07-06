import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIs = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockRange = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      is: mockIs,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
    })),
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
})

describe('getUnreadCount', () => {
  it('returns count of unread notifications', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockIs.mockResolvedValue({ count: 3, error: null })

    const { getUnreadCount } = await import('./queries')
    const count = await getUnreadCount()

    expect(count).toBe(3)
  })

  it('returns 0 on error', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockIs.mockResolvedValue({ count: null, error: new Error('DB error') })

    const { getUnreadCount } = await import('./queries')
    const count = await getUnreadCount()

    expect(count).toBe(0)
  })

  it('returns 0 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()

    const { getUnreadCount } = await import('./queries')
    const count = await getUnreadCount()

    expect(count).toBe(0)
  })
})

describe('getRecentNotifications', () => {
  it('returns recent notifications', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
    mockLimit.mockResolvedValue({
      data: [{ id: 'n1', title: 'Test' }],
      error: null,
    })

    const { getRecentNotifications } = await import('./queries')
    const result = await getRecentNotifications()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('n1')
  })

  it('returns empty array on error', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
    mockLimit.mockResolvedValue({
      data: null,
      error: new Error('DB error'),
    })

    const { getRecentNotifications } = await import('./queries')
    const result = await getRecentNotifications()

    expect(result).toEqual([])
  })

  it('returns empty when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()

    const { getRecentNotifications } = await import('./queries')
    const result = await getRecentNotifications()

    expect(result).toEqual([])
  })
})

describe('getAllNotifications', () => {
  it('returns paginated notifications', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
    mockRange.mockResolvedValue({
      data: [{ id: 'n1' }, { id: 'n2' }],
      count: 10,
      error: null,
    })

    const { getAllNotifications } = await import('./queries')
    const result = await getAllNotifications(1, 20)

    expect(result.notifications).toHaveLength(2)
    expect(result.total).toBe(10)
  })

  it('returns empty on error', async () => {
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
    mockRange.mockResolvedValue({
      data: null,
      count: null,
      error: new Error('DB error'),
    })

    const { getAllNotifications } = await import('./queries')
    const result = await getAllNotifications()

    expect(result.notifications).toEqual([])
    expect(result.total).toBe(0)
  })

  it('returns empty when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()

    const { getAllNotifications } = await import('./queries')
    const result = await getAllNotifications()

    expect(result.notifications).toEqual([])
    expect(result.total).toBe(0)
  })
})
