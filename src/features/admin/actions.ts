'use server'

import { createAdminSupabase } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import type { PendingPsychologist } from '@/features/admin/types'

export async function verifyPsychologist(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: true })
    .eq('id', profileId)

  if (error) {
    logger.error('verify_psychologist failed', error, { profileId })
    return { error: 'Error al verificar psicólogo' }
  }

  revalidatePath('/admin')
  revalidatePath('/psicologos')
  return {}
}

export async function rejectPsychologist(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: false })
    .eq('id', profileId)

  if (error) {
    logger.error('reject_psychologist failed', error, { profileId })
    return { error: 'Error al rechazar psicólogo' }
  }

  revalidatePath('/admin')
  return {}
}

export async function getPendingPsychologists(): Promise<PendingPsychologist[]> {
  const adminSupabase = createAdminSupabase()

  const { data } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      created_at,
      psychologist_profiles!inner (
        full_name,
        license_number,
        license_document
      )
    `)
    .eq('role', 'psychologist')
    .eq('psychologist_profiles.license_verified', false)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    ...(row.psychologist_profiles as unknown as { full_name: string; license_number: string; license_document: string | null }),
  }))
}
