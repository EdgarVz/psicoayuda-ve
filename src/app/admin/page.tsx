import type { Metadata } from 'next'
import { getPendingPsychologists, getAllAppointmentRequests } from '@/features/admin/actions'
import { PendingVerification } from '@/features/admin/components/pending-verification'
import { AppointmentRequestsTable } from '@/features/admin/components/appointment-requests-table'

export const metadata: Metadata = {
  title: 'Admin',
}

export default async function AdminPage() {
  const [pending, requests] = await Promise.all([
    getPendingPsychologists(),
    getAllAppointmentRequests(),
  ])

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold mb-6">Verificaciones pendientes</h1>
        <PendingVerification psychologists={pending} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Solicitudes de cita</h2>
        <AppointmentRequestsTable requests={requests} />
      </section>
    </div>
  )
}
