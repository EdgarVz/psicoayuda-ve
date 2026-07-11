import { createServerSupabase } from '@/lib/supabase/server'
import type { PatientRequestView, PsychologistRequestView, DashboardStats } from './types'

export async function getPatientRequests(userId: string): Promise<PatientRequestView[]> {
  const supabase = await createServerSupabase()

  interface RawRequest {
    id: string
    status: string
    reason: string[]
    created_at: string
    psychologist_id: string
    profiles: {
      display_name: string
      psychologist_profiles: { whatsapp_link: string | null } | null
    } | null
  }

  const { data } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      reason,
      created_at,
      psychologist_id,
      profiles!psychologist_id (
        display_name,
        psychologist_profiles ( whatsapp_link )
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return (data as RawRequest[] | null)?.map((row) => ({
    id: row.id,
    psychologistName: row.profiles?.display_name ?? 'Desconocido',
    psychologistId: row.psychologist_id,
    status: row.status as PatientRequestView['status'],
    reason: row.reason,
    createdAt: row.created_at,
    whatsappLink:
      row.status === 'accepted'
        ? (row.profiles?.psychologist_profiles?.whatsapp_link ?? null)
        : null,
  })) ?? []
}

export async function getPsychologistRequests(userId: string): Promise<PsychologistRequestView[]> {
  const supabase = await createServerSupabase()

  const { data: requests } = await supabase
    .from('appointment_requests')
    .select('id, status, reason, patient_age, created_at, patient_id')
    .eq('psychologist_id', userId)
    .order('created_at', { ascending: false })

  const rows = requests ?? []

  const patientIds = [...new Set(rows.map((r) => r.patient_id))] as string[]

  const nameByPatientId = new Map<string, string>()

  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', patientIds)

    for (const p of (patients ?? []) as { id: string; display_name: string }[]) {
      nameByPatientId.set(p.id, p.display_name)
    }
  }

  return rows.map((row) => ({
    id: row.id,
    patientName: nameByPatientId.get(row.patient_id) ?? 'Desconocido',
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