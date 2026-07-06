import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationDropdown } from './notification-dropdown'
import type { NotificationRow } from '@/features/notifications/types'

vi.mock('@/features/notifications/actions', () => ({
  markAsRead: vi.fn().mockResolvedValue({}),
  markAllAsRead: vi.fn().mockResolvedValue({}),
  refreshNotifications: vi.fn().mockResolvedValue({ count: 0, notifications: [] }),
}))

const mockNotifications: NotificationRow[] = [
  {
    id: 'n1',
    user_id: 'user-1',
    type: 'request_accepted',
    title: 'Test 1',
    body: 'Body 1',
    related_id: null,
    read_at: null,
    created_at: '2026-07-05T12:00:00.000Z',
  },
]

describe('NotificationDropdown', () => {
  it('renders bell button with badge', () => {
    render(<NotificationDropdown initialCount={3} initialNotifications={[]} />)
    expect(screen.getByLabelText('Notificaciones')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('renders dropdown content when clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationDropdown initialCount={1} initialNotifications={mockNotifications} />)
    await user.click(screen.getByLabelText('Notificaciones'))
    expect(screen.getByText('Notificaciones')).toBeDefined()
  })

  it('shows empty state when no notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationDropdown initialCount={0} initialNotifications={[]} />)
    await user.click(screen.getByLabelText('Notificaciones'))
    expect(screen.getByText('No hay notificaciones')).toBeDefined()
  })
})
