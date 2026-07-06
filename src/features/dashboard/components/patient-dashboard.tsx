import type { PatientRequestView, DashboardStats } from '@/features/dashboard/types'
import { StatsCards } from './stats-cards'
import { RequestsList } from './requests-list'

interface PatientDashboardProps {
  requests: PatientRequestView[]
  stats: DashboardStats
}

export function PatientDashboard({ requests, stats }: PatientDashboardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Mis espacios</h2>
      <p className="text-muted-foreground text-sm mb-6">Seguimiento de tus solicitudes de ayuda</p>
      <StatsCards stats={stats} />
      <RequestsList requests={requests} role="patient" />
    </div>
  )
}