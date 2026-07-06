import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationItem } from './notification-item'
import type { NotificationRow } from '@/features/notifications/types'

const mockNotification: NotificationRow = {
  id: 'notif-1',
  user_id: 'user-1',
  type: 'request_accepted',
  title: 'Solicitud aceptada',
  body: 'Tu solicitud fue aceptada.',
  related_id: null,
  read_at: null,
  created_at: '2026-07-05T12:00:00.000Z',
}

describe('NotificationItem', () => {
  it('renders notification title and body', () => {
    render(<NotificationItem notification={mockNotification} onMarkAsRead={() => {}} />)
    expect(screen.getByText('Solicitud aceptada')).toBeDefined()
    expect(screen.getByText('Tu solicitud fue aceptada.')).toBeDefined()
  })

  it('shows mark as read button for unread notification', () => {
    render(<NotificationItem notification={mockNotification} onMarkAsRead={() => {}} />)
    expect(screen.getByText('Leído')).toBeDefined()
  })

  it('does not show mark as read button for read notification', () => {
    const readNotification = { ...mockNotification, read_at: '2026-07-05T13:00:00.000Z' }
    render(<NotificationItem notification={readNotification} onMarkAsRead={() => {}} />)
    expect(screen.queryByText('Leído')).toBeNull()
  })

  it('calls onMarkAsRead when button clicked', async () => {
    const user = userEvent.setup()
    let called = false
    render(<NotificationItem notification={mockNotification} onMarkAsRead={() => { called = true }} />)
    await user.click(screen.getByText('Leído'))
    expect(called).toBe(true)
  })
})
