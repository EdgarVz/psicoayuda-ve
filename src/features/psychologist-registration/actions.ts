'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { withRateLimit } from '@/lib/rate-limit'
import { psychologistRegistrationSchema, type PsychologistRegistrationInput } from './schemas'
import { logger } from '@/lib/logger'
import { getResendClient } from '@/lib/resend'
import { revalidatePath } from 'next/cache'

export async function checkExistingProfile(): Promise<{ exists: boolean }> {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { exists: false }

    const { data } = await supabase
      .from('psychologist_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    return { exists: !!data }
  } catch (e) {
    logger.warn('checkExistingProfile failed', { error: e })
    return { exists: false }
  }
}

async function registerPsychologistImpl(
  input: PsychologistRegistrationInput
): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para registrarte como psicólogo' }

  const parsed = psychologistRegistrationSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const adminSupabase = createAdminSupabase()

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ role: 'psychologist' })
    .eq('id', user.id)

  if (profileError) {
    logger.error('register_psychologist profile update failed', profileError, { userId: user.id })
    return { error: 'Error al actualizar el perfil' }
  }

  const { error: insertError } = await adminSupabase
    .from('psychologist_profiles')
    .insert({
      id: user.id,
      full_name: parsed.data.fullName,
      license_number: parsed.data.licenseNumber,
      specialties: parsed.data.specialties,
      languages: parsed.data.languages,
      biography: parsed.data.biography,
      availability: { days: parsed.data.availabilityDays, hours: parsed.data.availabilityHours },
      whatsapp_link: parsed.data.whatsappLink,
    })

  if (insertError) {
    logger.error('register_psychologist insert failed', insertError, { userId: user.id })
    return { error: 'Error al crear el perfil de psicólogo. El número de colegiatura podría ya estar registrado.' }
  }

  try {
    const resend = await getResendClient()
    if (resend && user.email) {
      await resend.emails.send({
        from: 'PsicoAyuda VE <notificaciones@psicoayuda.org.ve>',
        to: user.email,
        subject: 'Registro recibido - PsicoAyuda VE',
        html: '<p>Hemos recibido tu solicitud de registro como psicólogo.</p><p>El equipo administrativo revisará tu información y te notificaremos cuando sea aprobada.</p><p>Gracias por sumarte a PsicoAyuda VE 🌱</p>',
      })
    }
  } catch (e) {
    logger.warn('Error enviando notificación de registro', { error: e })
  }

  revalidatePath('/dashboard')
  return {}
}

export const registerPsychologist = withRateLimit(registerPsychologistImpl, {
  limit: 5,
  windowMs: 60000,
  keyFn: () => 'register-psychologist',
})