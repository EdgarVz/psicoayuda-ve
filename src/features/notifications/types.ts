import type { Database } from '@/types/database'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationType = Database['public']['Enums']['notification_type']

export interface NotificationWithRelated extends NotificationRow {
  timeAgo?: string
}
