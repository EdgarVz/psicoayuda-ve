'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
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

  revalidatePath('/dashboard')
  return { data: { id: data.id } }
}

export async function acceptRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Debes iniciar sesión' }
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
