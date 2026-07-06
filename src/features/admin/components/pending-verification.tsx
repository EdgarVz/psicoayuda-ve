'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { verifyPsychologist, rejectPsychologist } from '@/features/admin/actions'
import { VerificationDetail } from './verification-detail'
import type { PendingPsychologist } from '@/features/admin/types'

interface PendingVerificationProps {
  psychologists: PendingPsychologist[]
}

export function PendingVerification({ psychologists }: PendingVerificationProps) {
  const [selected, setSelected] = useState<PendingPsychologist | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleVerify(id: string) {
    const result = await verifyPsychologist(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Psicólogo verificado correctamente')
    }
  }

  async function handleReject(id: string) {
    const result = await rejectPsychologist(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Psicólogo rechazado')
    }
  }

  if (psychologists.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">No hay psicólogos pendientes de verificación</p>
    )
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Psicólogo</th>
            <th className="pb-3 font-medium">Colegiatura</th>
            <th className="pb-3 font-medium">Documento</th>
            <th className="pb-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {psychologists.map((psy) => (
            <tr key={psy.id} className="border-b border-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background-alt flex items-center justify-center text-sm font-medium text-muted-foreground">
                    👩‍⚕️
                  </div>
                  <div>
                    <p className="font-medium">{psy.fullName}</p>
                    <p className="text-sm text-muted-foreground">{psy.displayName}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-sm">{psy.licenseNumber}</td>
              <td className="py-3">
                {psy.licenseDocument ? (
                  <button
                    onClick={() => setSelected(psy)}
                    className="text-primary text-sm hover:underline"
                  >
                    Ver documento
                  </button>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin documento</span>
                )}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setLoadingId(psy.id)
                      await handleVerify(psy.id)
                      setLoadingId(null)
                    }}
                    disabled={loadingId === psy.id}
                    className="text-sm bg-available text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    {loadingId === psy.id ? (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    Verificar
                  </button>
                  <button
                    onClick={async () => {
                      setLoadingId(psy.id)
                      await handleReject(psy.id)
                      setLoadingId(null)
                    }}
                    disabled={loadingId === psy.id}
                    className="text-sm bg-danger text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    {loadingId === psy.id ? (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    Rechazar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <VerificationDetail
          psychologist={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          onReject={handleReject}
          loadingId={loadingId}
        />
      )}
    </div>
  )
}
