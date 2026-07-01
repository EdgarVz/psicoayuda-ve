import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/features/psychologist/components/edit-profile-form'

export default async function EditarPerfilPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'psychologist') redirect('/dashboard')

  const { data: psyProfile } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!psyProfile) redirect('/dashboard')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Editar perfil</h1>
      <EditProfileForm
        initialData={{
          fullName: psyProfile.full_name,
          biography: psyProfile.biography,
          specialties: psyProfile.specialties ?? [],
          languages: psyProfile.languages ?? [],
          whatsappLink: psyProfile.whatsapp_link,
          isAvailable: psyProfile.is_available ?? true,
          yearsExperience: psyProfile.years_experience,
        }}
      />
    </div>
  )
}
