'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/resend'
import { appointmentRequestSchema, type AppointmentRequestInput } from './schemas'
import { logger } from '@/lib/logger'

export async function submitRequest(input: AppointmentRequestInput): Promise<
  { data: { id: string } } | { error: string }
> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión para solicitar una cita' }
  }

  const parsed = appointmentRequestSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: message }
  }

  const { data, error } = await supabase
    .from('appointment_requests')
    .insert({
      psychologist_id: parsed.data.psychologist_id,
      patient_id: user.id,
      patient_age: parsed.data.patient_age,
      reason: parsed.data.reason,
      preferred_schedule: parsed.data.preferred_schedule ?? null,
      consent_granted: true,
    })
    .select('id')
    .single()

  if (error) {
    logger.error('Failed to insert appointment request', error)
    return { error: 'Error al enviar la solicitud. Intenta de nuevo.' }
  }

  try {
    const resend = await getResendClient()
    const admin = createAdminSupabase()
    const { data: psychUser } = await admin.auth.admin.getUserById(parsed.data.psychologist_id)
    if (psychUser?.user?.email && resend) {
      await resend.emails.send({
        from: 'PsicoAyuda VE <notificaciones@psicoayuda.org.ve>',
        to: psychUser.user.email,
        subject: 'Nueva solicitud de cita - PsicoAyuda VE',
        html: '<p>Has recibido una nueva solicitud de cita.</p><p>Ingresa a tu panel para revisarla.</p>',
      })
    }
  } catch (e) {
    logger.warn('Error enviando notificación de nueva solicitud', { error: e })
  }

  revalidatePath('/dashboard')
  return { data: { id: data.id } }
}

export async function acceptRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  const { data: request } = await supabase
    .from('appointment_requests')
    .select('patient_id')
    .eq('id', requestId)
    .single()

  if (!request) {
    return { error: 'Solicitud no encontrada' }
  }

  const { error } = await supabase
    .from('appointment_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('psychologist_id', user.id)

  if (error) {
    logger.error('Failed to accept appointment request', error)
    return { error: 'Error al aceptar la solicitud.' }
  }

  try {
    const resend = await getResendClient()
    const admin = createAdminSupabase()
    const { data: patientUser } = await admin.auth.admin.getUserById(request.patient_id)
    if (patientUser?.user?.email && resend) {
      await resend.emails.send({
        from: 'PsicoAyuda VE <notificaciones@psicoayuda.org.ve>',
        to: patientUser.user.email,
        subject: 'Cita aceptada - PsicoAyuda VE',
        html: '<p>Tu solicitud de cita ha sido aceptada.</p><p>En breve el psicólogo se pondrá en contacto contigo.</p>',
      })
    }
  } catch (e) {
    logger.warn('Error enviando notificación de cita aceptada', { error: e })
  }

  revalidatePath('/dashboard')
  return {}
}

export async function rejectRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  const { error } = await supabase
    .from('appointment_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('psychologist_id', user.id)

  if (error) {
    logger.error('Failed to reject appointment request', error)
    return { error: 'Error al rechazar la solicitud.' }
  }

  revalidatePath('/dashboard')
  return {}
}
