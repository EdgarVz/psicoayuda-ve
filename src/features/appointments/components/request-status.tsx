import Link from 'next/link'
import type { AppointmentRequestStatus } from '@/features/appointments/types'
import { WhatsAppButton } from './whatsapp-button'

interface RequestStatusProps {
  status: AppointmentRequestStatus
  whatsappLink?: string | null
  psychologistName: string
  requestId?: string
}

export function RequestStatus({ status, whatsappLink, psychologistName, requestId }: RequestStatusProps) {
  if (status === 'pending') {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
          <span className="text-2xl">🌱</span>
        </div>
        <h2 className="text-xl font-semibold">Solicitud enviada</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Tu solicitud de cita con <strong>{psychologistName}</strong> ha sido enviada.
          Recibirás una notificación cuando sea aceptada.
        </p>
        <div className="bg-[#FAF6F1] rounded-radius-card p-4 text-sm text-left max-w-sm mx-auto">
          <p className="font-medium text-muted-foreground mb-1">Psicólogo asignado</p>
          <p className="text-foreground">{psychologistName}</p>
          {requestId && (
            <p className="text-muted-foreground mt-2 text-xs">Solicitud #{requestId.slice(0, 7).toUpperCase()}</p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Solicitud aceptada</h2>
        <p className="text-muted-foreground">
          <strong>{psychologistName}</strong> ha aceptado tu solicitud.
          Puedes contactarlo por WhatsApp para coordinar los detalles.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-radius-card p-4 text-sm text-left mb-4">
          <p className="font-medium text-green-800 mb-1">Mensaje predeterminado:</p>
          <p className="text-green-700">&ldquo;Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico.&rdquo;</p>
        </div>
        <WhatsAppButton whatsappLink={whatsappLink ?? null} />
      </div>
    )
  }

  return (
    <div className="text-center py-12 space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">Solicitud no aceptada</h2>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Lo sentimos, {psychologistName} no ha podido aceptar tu solicitud en este momento.
        Puedes buscar otro psicólogo disponible.
      </p>
      <Link
        href="/psicologos"
        className="inline-block px-6 py-3 rounded-radius-button bg-primary text-white font-medium hover:bg-primary-light transition-colors"
      >
        Ver otros psicólogos
      </Link>
    </div>
  )
}
