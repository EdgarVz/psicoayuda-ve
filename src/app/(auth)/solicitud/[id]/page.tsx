import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { RequestStatus } from '@/features/appointments/components/request-status'
import type { AppointmentRequestStatus } from '@/features/appointments/types'
import type { NestedPatientProfile } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SolicitudPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    notFound()
  }

  const { data: requestData, error } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      psychologist_id,
      profiles!appointment_requests_psychologist_id_fkey (
        display_name,
        psychologist_profiles (
          whatsapp_link
        )
      )
    `)
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (error || !requestData) {
    notFound()
  }

  const profile = requestData.profiles as unknown as NestedPatientProfile

  const displayName = profile.display_name
  const psyProfile = Array.isArray(profile.psychologist_profiles)
    ? profile.psychologist_profiles[0]
    : profile.psychologist_profiles
  const whatsappLink = psyProfile?.whatsapp_link ?? null

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <RequestStatus
        status={requestData.status as AppointmentRequestStatus}
        whatsappLink={whatsappLink}
        psychologistName={displayName}
        requestId={id}
      />
    </div>
  )
}
