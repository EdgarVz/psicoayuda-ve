import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { RegistrationForm } from '@/features/psychologist-registration/components/registration-form'

export const metadata: Metadata = {
  title: 'Registro de psicólogo',
  description: 'Regístrate como psicólogo voluntario en PsicoAyuda VE',
}

export default async function RegistroPsicologoPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile } = await supabase
      .from('psychologist_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Regístrate como psicólogo</h1>
        <p className="text-muted">
          Completa tus datos para aparecer en nuestro directorio de psicólogos voluntarios
        </p>
      </div>

      <RegistrationForm />
    </div>
  )
}