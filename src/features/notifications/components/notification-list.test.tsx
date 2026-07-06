import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/features/notifications/queries', () => ({
  getAllNotifications: vi.fn().mockResolvedValue({
    notifications: [
      { id: 'n1', user_id: 'u1', type: 'request_accepted', title: 'Test 1', body: 'Body 1', related_id: null, read_at: null, created_at: '2026-07-05T12:00:00.000Z' },
      { id: 'n2', user_id: 'u1', type: 'request_rejected', title: 'Test 2', body: 'Body 2', related_id: null, read_at: '2026-07-05T13:00:00.000Z', created_at: '2026-07-05T11:00:00.000Z' },
    ],
    total: 10,
  }),
}))

vi.mock('@/features/notifications/actions', () => ({
  markAsRead: vi.fn().mockResolvedValue({}),
  refreshNotifications: vi.fn().mockResolvedValue({ count: 0, notifications: [] }),
  getAllNotificationsAction: vi.fn().mockResolvedValue({
    notifications: [
      { id: 'n1', user_id: 'u1', type: 'request_accepted', title: 'Test 1', body: 'Body 1', related_id: null, read_at: null, created_at: '2026-07-05T12:00:00.000Z' },
      { id: 'n2', user_id: 'u1', type: 'request_rejected', title: 'Test 2', body: 'Body 2', related_id: null, read_at: '2026-07-05T13:00:00.000Z', created_at: '2026-07-05T11:00:00.000Z' },
    ],
    total: 10,
  }),
}))

describe('NotificationList', () => {
  it('renders page title', async () => {
    const { NotificationList } = await import('./notification-list')
    render(<NotificationList />)
    expect(screen.getByText('Notificaciones')).toBeDefined()
  })
})
