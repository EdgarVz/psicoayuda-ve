import type { DashboardStats } from '@/features/dashboard/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
    { label: 'Pendientes', value: stats.pending, color: 'bg-warning/10 text-warning' },
    { label: 'Aceptadas', value: stats.accepted, color: 'bg-green-100 text-green-700' },
    { label: 'Rechazadas', value: stats.rejected, color: 'bg-red-50 text-danger' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, color }) => (
        <div key={label} className={`${color} rounded-radius-card p-4 text-center`}>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}