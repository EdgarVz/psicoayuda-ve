import { describe, it, expect } from 'vitest'
import { createNotificationSchema, markAsReadSchema } from './schemas'

describe('createNotificationSchema', () => {
  it('accepts valid input', () => {
    const result = createNotificationSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Solicitud aceptada',
      body: 'Tu solicitud fue aceptada.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createNotificationSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: '',
      body: 'Tu solicitud fue aceptada.',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional relatedId', () => {
    const result = createNotificationSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'request_accepted',
      title: 'Solicitud aceptada',
      body: 'Tu solicitud fue aceptada.',
      relatedId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid notification type', () => {
    const result = createNotificationSchema.safeParse({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'invalid_type',
      title: 'Test',
      body: 'Test body',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID userId', () => {
    const result = createNotificationSchema.safeParse({
      userId: 'not-a-uuid',
      type: 'request_accepted',
      title: 'Test',
      body: 'Test body',
    })
    expect(result.success).toBe(false)
  })
})

describe('markAsReadSchema', () => {
  it('accepts valid UUID', () => {
    const result = markAsReadSchema.safeParse({
      notificationId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = markAsReadSchema.safeParse({
      notificationId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})
