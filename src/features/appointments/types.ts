import type { Database } from '@/types/database'

export type AppointmentRequest = Database['public']['Tables']['appointment_requests']['Row']
export type AppointmentRequestStatus = Database['public']['Enums']['request_status']
