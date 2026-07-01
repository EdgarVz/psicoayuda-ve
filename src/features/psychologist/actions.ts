'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { PsychologistProfileUpdateSchema } from '@/features/psychologist/schemas'
import type { PsychologistProfileUpdateInput } from '@/features/psychologist/schemas'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function updatePsychologistProfile(
  input: PsychologistProfileUpdateInput
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const parsed = PsychologistProfileUpdateSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const adminSupabase = createAdminSupabase()

  const updateData: Record<string, unknown> = {
    full_name: parsed.data.fullName,
    specialties: parsed.data.specialties,
    languages: parsed.data.languages,
  }

  if (parsed.data.biography !== undefined) {
    updateData.biography = parsed.data.biography || null
  }
  if (parsed.data.whatsappLink !== undefined) {
    updateData.whatsapp_link = parsed.data.whatsappLink || null
  }
  if (parsed.data.isAvailable !== undefined) {
    updateData.is_available = parsed.data.isAvailable
  }
  if (parsed.data.yearsExperience !== undefined) {
    updateData.years_experience = parsed.data.yearsExperience
  }

  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    logger.error('Failed to update psychologist profile', error)
    return { error: 'Error al actualizar el perfil' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/psicologo/${user.id}`)
  return { success: true }
}
