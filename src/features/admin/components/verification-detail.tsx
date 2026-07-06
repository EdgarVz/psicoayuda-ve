'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PendingPsychologist } from '@/features/admin/types'

interface VerificationDetailProps {
  psychologist: PendingPsychologist
  onClose: () => void
  onVerify: (id: string) => void
  onReject: (id: string) => void
  loadingId?: string | null
}

export function VerificationDetail({ psychologist, onClose, onVerify, onReject, loadingId }: VerificationDetailProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{psychologist.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Nombre de usuario:</span>
            <p>{psychologist.displayName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Número de colegiatura:</span>
            <p>{psychologist.licenseNumber}</p>
          </div>
          {psychologist.licenseDocument && (
            <div>
              <span className="text-muted-foreground">Documento:</span>
              <a
                href={psychologist.licenseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline mt-1"
              >
                Abrir documento
              </a>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Registrado el:</span>
            <p>{new Date(psychologist.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onVerify(psychologist.id); onClose() }}
            disabled={loadingId === psychologist.id}
            className="flex-1 bg-available text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
          >
            {loadingId === psychologist.id ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Verificar
          </button>
          <button
            onClick={() => { onReject(psychologist.id); onClose() }}
            disabled={loadingId === psychologist.id}
            className="flex-1 bg-danger text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
          >
            {loadingId === psychologist.id ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Rechazar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
