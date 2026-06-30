import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getPatientRequests, getPsychologistRequests, getPatientStats, getPsychologistStats } from '@/features/dashboard/queries'
import { PatientDashboard } from '@/features/dashboard/components/patient-dashboard'
import { PsychologistDashboard } from '@/features/dashboard/components/psychologist-dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tus solicitudes de ayuda psicológica',
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role === 'patient') {
    const [requests, stats] = await Promise.all([
      getPatientRequests(user.id),
      getPatientStats(user.id),
    ])

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PatientDashboard requests={requests} stats={stats} />
      </div>
    )
  }

  if (profile.role === 'psychologist') {
    const [requests, stats] = await Promise.all([
      getPsychologistRequests(user.id),
      getPsychologistStats(user.id),
    ])

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PsychologistDashboard requests={requests} stats={stats} />
      </div>
    )
  }

  redirect('/')
}