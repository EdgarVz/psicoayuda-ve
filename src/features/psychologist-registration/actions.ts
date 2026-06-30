'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { psychologistRegistrationSchema, type PsychologistRegistrationInput } from './schemas'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function registerPsychologist(input: PsychologistRegistrationInput): Promise<{ success?: true; error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para registrarte como psicólogo' }

  const parsed = psychologistRegistrationSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const admin = createAdminSupabase()

  const { error: roleError } = await admin
    .from('profiles')
    .update({ role: 'psychologist', display_name: parsed.data.full_name })
    .eq('id', user.id)

  if (roleError) {
    logger.error('register_psychologist role update failed', roleError)
    return { error: 'Error al actualizar tu perfil' }
  }

  const { error: insertError } = await admin
    .from('psychologist_profiles')
    .insert({
      id: user.id,
      full_name: parsed.data.full_name,
      license_number: parsed.data.license_number,
      specialties: parsed.data.specialties,
      is_available: false,
    })

  if (insertError) {
    logger.error('register_psychologist insert failed', insertError)
    await admin.from('profiles').update({ role: 'patient' }).eq('id', user.id)
    return { error: 'Error al crear tu perfil de psicólogo' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
