'use server'

import { createAdminSupabase } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { getResendClient } from '@/lib/resend'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/features/notifications/actions'
import type { PendingPsychologist, AdminAppointmentRequest } from '@/features/admin/types'

async function checkAdminAuth(): Promise<{ error?: string } | { userId: string }> {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión' }

    const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
    if (!admin.data) return { error: 'No autorizado' }

    return { userId: user.id }
  } catch (e) {
    logger.warn('checkAdminAuth failed', { error: e })
    return { error: 'Error de autenticación' }
  }
}

export async function verifyPsychologist(profileId: string): Promise<{ error?: string }> {
  const auth = await checkAdminAuth()
  if ('error' in auth) return auth

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: true })
    .eq('id', profileId)

  if (error) {
    logger.error('verify_psychologist failed', error, { profileId })
    return { error: 'Error al verificar psicólogo' }
  }

  try {
    const resend = await getResendClient()
    const { data: userData } = await adminSupabase.auth.admin.getUserById(profileId)
    if (userData?.user?.email && resend) {
      await resend.emails.send({
        from: 'PsicoAyuda VE <notificaciones@psicoayuda.org.ve>',
        to: userData.user.email,
        subject: 'Perfil verificado - PsicoAyuda VE',
        html: '<p>Tu perfil como psicólogo ha sido verificado exitosamente.</p><p>Ya apareces en el catálogo de psicólogos disponible para los pacientes.</p>',
      })
    }
  } catch (e) {
    logger.warn('Error enviando notificación de verificación', { error: e })
  }

  await createNotification({
    userId: profileId,
    type: 'profile_verified',
    title: 'Perfil verificado',
    body: 'Tu perfil como psicólogo ha sido verificado. Ya apareces en el catálogo.',
    relatedId: profileId,
  })

  revalidatePath('/admin')
  revalidatePath('/psicologos')
  return {}
}

export async function rejectPsychologist(profileId: string): Promise<{ error?: string }> {
  const auth = await checkAdminAuth()
  if ('error' in auth) return auth

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: false })
    .eq('id', profileId)

  if (error) {
    logger.error('reject_psychologist failed', error, { profileId })
    return { error: 'Error al rechazar psicólogo' }
  }

  try {
    const resend = await getResendClient()
    const { data: userData } = await adminSupabase.auth.admin.getUserById(profileId)
    if (userData?.user?.email && resend) {
      await resend.emails.send({
        from: 'PsicoAyuda VE <notificaciones@psicoayuda.org.ve>',
        to: userData.user.email,
        subject: 'Registro rechazado - PsicoAyuda VE',
        html: '<p>Tu solicitud de registro como psicólogo no ha sido aprobada.</p><p>Si crees que hay un error, contacta con el equipo administrativo.</p>',
      })
    }
  } catch (e) {
    logger.warn('Error enviando notificación de rechazo', { error: e })
  }

  await createNotification({
    userId: profileId,
    type: 'profile_rejected',
    title: 'Registro rechazado',
    body: 'Tu solicitud de registro como psicólogo no fue aprobada. Contacta al equipo administrativo si crees que hay un error.',
    relatedId: profileId,
  })

  revalidatePath('/admin')
  return {}
}

export async function getPendingPsychologists(): Promise<PendingPsychologist[]> {
  try {
    const adminSupabase = createAdminSupabase()

    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('id, display_name, avatar_url, created_at')
      .eq('role', 'psychologist')
      .order('created_at', { ascending: false })

    if (profilesError) {
      logger.error('getPendingPsychologists profiles query failed', profilesError)
      return []
    }

    const profileIds = (profiles ?? []).map((p) => p.id)
    if (profileIds.length === 0) return []

    const { data: psyProfiles, error: psyError } = await adminSupabase
      .from('psychologist_profiles')
      .select('id, full_name, license_number, license_document, license_verified')
      .in('id', profileIds)

    if (psyError) {
      logger.error('getPendingPsychologists psyProfiles query failed', psyError)
      return []
    }

    const pendingIds = new Set(
      (psyProfiles ?? [])
        .filter((p) => !p.license_verified)
        .map((p) => p.id)
    )

    const psyById = new Map(
      (psyProfiles ?? []).map((p) => [p.id, p])
    )

    return (profiles ?? [])
      .filter((p) => pendingIds.has(p.id))
      .map((row) => {
        const psy = psyById.get(row.id)!
        return {
          id: row.id,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          fullName: psy.full_name,
          licenseNumber: psy.license_number,
          licenseDocument: psy.license_document,
        }
      })
  } catch (e) {
    logger.error('getPendingPsychologists unexpected error', { error: e })
    return []
  }
}

export async function getAllAppointmentRequests(): Promise<AdminAppointmentRequest[]> {
  try {
    const adminSupabase = createAdminSupabase()

    const { data: requests, error: reqError } = await adminSupabase
      .from('appointment_requests')
      .select('id, patient_id, psychologist_id, reason, status, created_at')
      .order('created_at', { ascending: false })

    if (reqError) {
      logger.error('getAllAppointmentRequests failed', reqError)
      return []
    }

    const allIds = new Set<string>()
    for (const r of requests ?? []) {
      allIds.add(r.patient_id)
      allIds.add(r.psychologist_id)
    }

    const ids = [...allIds] as string[]
    if (ids.length === 0) return []

    const { data: profiles, error: profError } = await adminSupabase
      .from('profiles')
      .select('id, display_name')
      .in('id', ids)

    if (profError) {
      logger.error('getAllAppointmentRequests profiles query failed', profError)
      return []
    }

    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

    return (requests ?? []).map((row) => ({
      id: row.id,
      patientName: nameById.get(row.patient_id) ?? 'Desconocido',
      psychologistName: nameById.get(row.psychologist_id) ?? 'Desconocido',
      reason: row.reason,
      status: row.status ?? 'pending',
      createdAt: row.created_at ?? '',
    }))
  } catch (e) {
    logger.error('getAllAppointmentRequests unexpected error', { error: e })
    return []
  }
}
