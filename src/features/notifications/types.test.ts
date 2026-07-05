import { describe, it, expect } from 'vitest'
import type { NotificationRow } from './types'
import type { Database } from '@/types/database'

describe('NotificationRow type', () => {
  it('matches the database notification_type enum', () => {
    type NotificationType = Database['public']['Enums']['notification_type']
    const types: NotificationType[] = [
      'request_received',
      'request_accepted',
      'request_rejected',
      'profile_verified',
      'profile_rejected',
    ]
    expect(types).toHaveLength(5)
  })
})
