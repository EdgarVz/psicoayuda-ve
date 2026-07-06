'use client'

import { useState } from 'react'
import { acceptRequest, rejectRequest } from '@/features/appointments/actions'
import { SPECIALTY_LABELS } from '@/lib/specialties'
import type { PatientRequestView, PsychologistRequestView } from '@/features/dashboard/types'

interface RequestsListProps {
  requests: PatientRequestView[] | PsychologistRequestView[]
  role?: 'patient' | 'psychologist'
}

export function RequestsList({ requests, role }: RequestsListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  const tabs = [
    { key: 'all' as const, label: 'Todas' },
    { key: 'pending' as const, label: 'Esperando' },
    { key: 'accepted' as const, label: 'Aceptadas' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm rounded-radius-button transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white border border-border rounded-radius-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                req.status === 'pending' ? 'bg-warning/10 text-warning-text' :
                req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                'bg-red-50 text-danger'
              }`}>
                {req.status === 'pending' ? 'Pendiente' :
                 req.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(req.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>

            {'patientName' in req ? (
              <div>
                <p className="font-medium">{req.patientName} · {req.patientAge} años</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {req.reason.map((r) => (
                    <span key={r} className="text-xs bg-background-alt text-muted-foreground px-2 py-0.5 rounded-full">
                      {SPECIALTY_LABELS[r] ?? r}
                    </span>
                  ))}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        setLoadingId(req.id)
                        await acceptRequest(req.id)
                        setLoadingId(null)
                      }}
                      disabled={loadingId === req.id}
                      className="text-sm bg-available text-white px-4 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      {loadingId === req.id ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      Aceptar
                    </button>
                    <button
                      onClick={async () => {
                        setLoadingId(req.id)
                        await rejectRequest(req.id)
                        setLoadingId(null)
                      }}
                      disabled={loadingId === req.id}
                      className="text-sm bg-danger text-white px-4 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      {loadingId === req.id ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium">{req.psychologistName}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {req.reason.map((r) => (
                    <span key={r} className="text-xs bg-background-alt text-muted-foreground px-2 py-0.5 rounded-full">
                      {SPECIALTY_LABELS[r] ?? r}
                    </span>
                  ))}
                </div>
                {req.status === 'accepted' && req.whatsappLink && (
                  <a
                    href={req.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 bg-[#25d366] text-white px-4 py-2 rounded-radius-button text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white border border-border rounded-radius-card">
            <p className="text-lg font-medium text-foreground mb-2">
              No hay solicitudes {filter !== 'all' ? (filter === 'pending' ? 'pendientes' : 'aceptadas') : ''}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {role === 'psychologist'
                ? 'Aún no has recibido solicitudes. Asegúrate de que tu perfil esté completo para que los pacientes te encuentren.'
                : 'No has enviado ninguna solicitud aún. Explora nuestro catálogo de psicólogos y da el primer paso.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}