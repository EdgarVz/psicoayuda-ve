import type { PsychologistRequestView, DashboardStats } from '@/features/dashboard/types'
import { StatsCards } from './stats-cards'
import { RequestsList } from './requests-list'

interface PsychologistDashboardProps {
  requests: PsychologistRequestView[]
  stats: DashboardStats
}

export function PsychologistDashboard({ requests, stats }: PsychologistDashboardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Solicitudes recibidas</h2>
      <p className="text-muted-foreground text-sm mb-6">Gestiona las solicitudes de ayuda de los pacientes</p>
      <StatsCards stats={stats} />
      <RequestsList requests={requests} />
    </div>
  )
}