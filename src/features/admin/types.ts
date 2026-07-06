export interface PendingPsychologist {
  id: string
  displayName: string
  fullName: string
  licenseNumber: string
  licenseDocument: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface AdminAppointmentRequest {
  id: string
  patientName: string
  psychologistName: string | null
  reason: string[]
  status: string
  createdAt: string
}
