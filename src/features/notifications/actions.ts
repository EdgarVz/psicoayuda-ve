'use server'

import { createAdminSupabase } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { createNotificationSchema, type CreateNotificationInput } from './schemas'
import { getAllNotifications, getUnreadCount, getRecentNotifications } from './queries'
import type { NotificationRow } from './types'
import { logger } from '@/lib/logger'

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const parsed = createNotificationSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('createNotification: invalid input', { error: parsed.error })
    return
  }

  const supabase = createAdminSupabase()
  const { error } = await supabase.from('notifications').insert({
    user_id: parsed.data.userId,
    type: parsed.data.type,
    title: parsed.data.title,
    body: parsed.data.body,
    related_id: parsed.data.relatedId ?? null,
  })

  if (error) {
    logger.error('createNotification: insert failed', error)
  }
}

export async function markAsRead(notificationId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    logger.error('markAsRead failed', error)
    return { error: 'Error al marcar como leída' }
  }

  return {}
}

export async function markAllAsRead(): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    logger.error('markAllAsRead failed', error)
    return { error: 'Error al marcar como leídas' }
  }

  return {}
}

export async function getAllNotificationsAction(
  page = 1,
  pageSize = 20,
): Promise<{ notifications: NotificationRow[]; total: number }> {
  return getAllNotifications(page, pageSize)
}

export async function refreshNotifications(): Promise<{ count: number; notifications: NotificationRow[] }> {
  const [count, notifications] = await Promise.all([
    getUnreadCount(),
    getRecentNotifications(),
  ])
  return { count, notifications }
}
