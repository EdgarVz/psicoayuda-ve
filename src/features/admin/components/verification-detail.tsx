'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PendingPsychologist } from '@/features/admin/types'

interface VerificationDetailProps {
  psychologist: PendingPsychologist
  onClose: () => void
  onVerify: (id: string) => void
  onReject: (id: string) => void
}

export function VerificationDetail({ psychologist, onClose, onVerify, onReject }: VerificationDetailProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{psychologist.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted">Nombre de usuario:</span>
            <p>{psychologist.displayName}</p>
          </div>
          <div>
            <span className="text-muted">Número de colegiatura:</span>
            <p>{psychologist.licenseNumber}</p>
          </div>
          {psychologist.licenseDocument && (
            <div>
              <span className="text-muted">Documento:</span>
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
            <span className="text-muted">Registrado el:</span>
            <p>{new Date(psychologist.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onVerify(psychologist.id); onClose() }}
            className="flex-1 bg-available text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Verificar
          </button>
          <button
            onClick={() => { onReject(psychologist.id); onClose() }}
            className="flex-1 bg-danger text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Rechazar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
