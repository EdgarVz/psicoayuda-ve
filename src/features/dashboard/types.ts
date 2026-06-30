import type { AppointmentRequestStatus } from '@/features/appointments/types'

export interface PatientRequestView {
  id: string
  psychologistName: string
  psychologistId: string
  status: AppointmentRequestStatus
  reason: string[]
  createdAt: string
  whatsappLink: string | null
}

export interface PsychologistRequestView {
  id: string
  patientName: string
  patientAge: number
  reason: string[]
  status: AppointmentRequestStatus
  createdAt: string
}

export interface DashboardStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}