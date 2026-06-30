import { createServerSupabase } from '@/lib/supabase/server'
import type { PatientRequestView, PsychologistRequestView, DashboardStats } from './types'

export async function getPatientRequests(userId: string): Promise<PatientRequestView[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      reason,
      created_at,
      psychologist_id,
      psychologist_profiles!inner (
        whatsapp_link,
        profiles!inner (
          display_name
        )
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => {
    const psy = row.psychologist_profiles as unknown as {
      whatsapp_link: string | null
      profiles: { display_name: string }
    }
    return {
      id: row.id,
      psychologistName: psy.profiles.display_name,
      psychologistId: row.psychologist_id,
      status: row.status,
      reason: row.reason,
      createdAt: row.created_at,
      whatsappLink: row.status === 'accepted' ? psy.whatsapp_link : null,
    }
  })
}

export async function getPsychologistRequests(userId: string): Promise<PsychologistRequestView[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      reason,
      patient_age,
      created_at,
      profiles!inner (
        display_name
      )
    `)
    .eq('psychologist_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    patientName: (row.profiles as unknown as { display_name: string }).display_name,
    patientAge: row.patient_age,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }))
}

export async function getPatientStats(userId: string): Promise<DashboardStats> {
  const requests = await getPatientRequests(userId)
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}

export async function getPsychologistStats(userId: string): Promise<DashboardStats> {
  const requests = await getPsychologistRequests(userId)
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}