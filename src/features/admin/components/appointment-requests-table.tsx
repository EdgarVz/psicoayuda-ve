'use client'

import type { AdminAppointmentRequest } from '@/features/admin/types'
import { SPECIALTY_LABELS } from '@/lib/specialties'

interface AppointmentRequestsTableProps {
  requests: AdminAppointmentRequest[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function AppointmentRequestsTable({ requests }: AppointmentRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">No hay solicitudes de cita registradas</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Paciente</th>
            <th className="pb-3 font-medium">Psicólogo</th>
            <th className="pb-3 font-medium">Motivo</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-border text-sm">
              <td className="py-3">{req.patientName}</td>
              <td className="py-3">{req.psychologistName}</td>
              <td className="py-3">
                {req.reason.map((r) => SPECIALTY_LABELS[r] ?? r).join(', ')}
              </td>
              <td className="py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status] ?? ''}`}>
                  {STATUS_LABELS[req.status] ?? req.status}
                </span>
              </td>
              <td className="py-3 text-muted-foreground">
                {new Date(req.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
