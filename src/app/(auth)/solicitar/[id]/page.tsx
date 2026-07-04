import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { RequestForm } from '@/features/appointments/components/request-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', id)
    .single()

  return {
    title: data ? `Solicitar cita con ${data.display_name}` : 'Solicitar cita',
  }
}

export default async function SolicitarPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      display_name,
      psychologist_profiles!inner (
        is_available,
        license_verified
      )
    `)
    .eq('id', id)
    .eq('role', 'psychologist')
    .single()

  if (!profile) {
    notFound()
  }

  const psyProfile = Array.isArray(profile.psychologist_profiles)
    ? profile.psychologist_profiles[0]
    : profile.psychologist_profiles

  if (!psyProfile?.is_available || !psyProfile?.license_verified) {
    notFound()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Solicitar cita con {profile.display_name}
      </h1>
      <RequestForm psychologistId={id} psychologistName={profile.display_name} />
    </div>
  )
}
