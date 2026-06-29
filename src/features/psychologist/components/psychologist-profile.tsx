import Image from 'next/image'
import Link from 'next/link'
import type { PsychologistDetail } from '@/features/psychologist/queries'

interface PsychologistProfileProps {
  psychologist: PsychologistDetail
}

const SPECIALTY_LABELS: Record<string, string> = {
  duelo: 'Duelo',
  ansiedad: 'Ansiedad',
  crisis_panico: 'Crisis de pánico',
  trauma: 'Trauma',
  apoyo_ninos: 'Apoyo niños',
  apoyo_adolescentes: 'Apoyo adolescentes',
  depresion: 'Depresión',
  estres: 'Estrés',
  violencia: 'Violencia',
  adicciones: 'Adicciones',
}

export function PsychologistProfile({ psychologist }: PsychologistProfileProps) {
  const initial = psychologist.fullName.charAt(0).toUpperCase()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-start gap-5">
            <div className="relative w-28 h-28 rounded-full overflow-hidden flex-shrink-0 bg-background-alt">
              {psychologist.avatarUrl ? (
                <Image
                  src={psychologist.avatarUrl}
                  alt={psychologist.fullName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-muted">
                  {initial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">{psychologist.fullName}</h1>
                {psychologist.licenseVerified && (
                  <span className="text-xs bg-available/10 text-available px-2.5 py-0.5 rounded-full font-medium">
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-muted mt-0.5">{psychologist.displayName}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {psychologist.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-background-alt text-muted-foreground px-3 py-1 rounded-full"
                  >
                    {SPECIALTY_LABELS[s] ?? s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    psychologist.isAvailable ? 'bg-available' : 'bg-unavailable'
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {psychologist.isAvailable
                    ? 'Disponible ahora'
                    : 'No disponible temporalmente'}
                </span>
              </div>
            </div>
          </div>

          {psychologist.biography && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Sobre mí</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {psychologist.biography}
              </p>
            </section>
          )}
        </div>

        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-radius-card border border-border p-6 space-y-4">
            <h2 className="font-semibold text-lg">¿Cómo funciona?</h2>

            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Solicitas una cita con el psicólogo</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>El psicólogo acepta tu solicitud</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Recibes el enlace de WhatsApp para contactarlo</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <span>No almacenamos conversaciones ni datos clínicos</span>
              </li>
            </ol>
          </div>

          <div className="mt-4">
            {psychologist.isAvailable ? (
              <Link
                href={`/solicitar/${psychologist.id}`}
                className="block w-full text-center px-6 py-3 rounded-radius-button font-semibold text-white transition-colors"
                style={{ backgroundColor: '#25d366' }}
              >
                Solicitar cita por WhatsApp
              </Link>
            ) : (
              <div className="w-full text-center px-6 py-3 rounded-radius-button font-semibold bg-unavailable/20 text-muted cursor-not-allowed">
                Vuelve pronto
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
