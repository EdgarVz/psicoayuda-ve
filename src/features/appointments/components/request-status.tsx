'use client'

import Link from 'next/link'
import type { AppointmentRequestStatus } from '@/features/appointments/types'

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
        <p className="text-muted max-w-sm mx-auto">
          Tu solicitud de cita con <strong>{psychologistName}</strong> ha sido enviada.
          Recibirás una notificación cuando sea aceptada.
        </p>
        <div className="bg-[#FAF6F1] rounded-radius-card p-4 text-sm text-left max-w-sm mx-auto">
          <p className="font-medium text-muted mb-1">Psicólogo asignado</p>
          <p className="text-foreground">{psychologistName}</p>
          {requestId && (
            <p className="text-muted mt-2 text-xs">Solicitud #{requestId.slice(0, 7).toUpperCase()}</p>
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
        <p className="text-muted">
          <strong>{psychologistName}</strong> ha aceptado tu solicitud.
          Puedes contactarlo por WhatsApp para coordinar los detalles.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-radius-card p-4 text-sm text-left mb-4">
          <p className="font-medium text-green-800 mb-1">Mensaje predeterminado:</p>
          <p className="text-green-700">&ldquo;Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico.&rdquo;</p>
        </div>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-radius-button text-white font-medium animate-pulse"
            style={{ backgroundColor: '#25d366', animationDuration: '3.5s' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        )}
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
      <p className="text-muted max-w-sm mx-auto">
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
