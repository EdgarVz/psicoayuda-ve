import { z } from 'zod'

const notificationTypes = [
  'request_received',
  'request_accepted',
  'request_rejected',
  'profile_verified',
  'profile_rejected',
] as const

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(notificationTypes),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  relatedId: z.string().uuid().optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

export const markAsReadSchema = z.object({
  notificationId: z.string().uuid(),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
