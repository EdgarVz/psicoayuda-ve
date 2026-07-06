import { createServerSupabase } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { NotificationRow } from './types'

export async function getUnreadCount(): Promise<number> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    logger.error('getUnreadCount failed', error)
    return 0
  }

  return count ?? 0
}

export async function getRecentNotifications(limit = 5): Promise<NotificationRow[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('getRecentNotifications failed', error)
    return []
  }

  return data ?? []
}

export async function getAllNotifications(
  page = 1,
  pageSize = 20,
): Promise<{ notifications: NotificationRow[]; total: number }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [], total: 0 }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    logger.error('getAllNotifications failed', error)
    return { notifications: [], total: 0 }
  }

  return { notifications: data ?? [], total: count ?? 0 }
}
