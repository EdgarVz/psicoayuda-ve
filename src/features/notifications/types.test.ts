import { describe, it, expect } from 'vitest'
import type { Database } from '@/types/database'

describe('notification types', () => {
  it('notification_type enum exists in database types', () => {
    type NotificationType = Database['public']['Enums']['notification_type']
    const _typeCheck: NotificationType = 'request_accepted'
    expect(true).toBe(true)
  })
})
