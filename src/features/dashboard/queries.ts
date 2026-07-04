import { createServerSupabase } from '@/lib/supabase/server'
import type { PatientRequestView, PsychologistRequestView, DashboardStats } from './types'

interface NestedPsychologistProfile {
  id: string
  whatsapp_link: string | null
}

interface NestedPatientProfile {
  display_name: string
}

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
      profiles!psychologist_id_fkey (
        display_name
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  const psychologistIds = [...new Set((data ?? []).map((r) => r.psychologist_id))] as string[]

  const whatsappByPsychId = new Map<string, string | null>()
  if (psychologistIds.length > 0) {
    const { data: psyProfiles } = await supabase
      .from('psychologist_profiles')
      .select('id, whatsapp_link')
      .in('id', psychologistIds)

    for (const p of (psyProfiles ?? []) as NestedPsychologistProfile[]) {
      whatsappByPsychId.set(p.id, p.whatsapp_link)
    }
  }

  return (data ?? []).map((row) => {
    const psyProfile = row.profiles as unknown as { display_name: string }
    return {
      id: row.id,
      psychologistName: psyProfile.display_name,
      psychologistId: row.psychologist_id,
      status: row.status,
      reason: row.reason,
      createdAt: row.created_at,
      whatsappLink: row.status === 'accepted' ? (whatsappByPsychId.get(row.psychologist_id) ?? null) : null,
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
    patientName: (row.profiles as unknown as NestedPatientProfile).display_name,
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