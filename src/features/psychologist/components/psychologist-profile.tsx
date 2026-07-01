import Image from 'next/image'
import Link from 'next/link'
import type { PsychologistDetail } from '@/features/psychologist/queries'
import { SPECIALTY_LABELS } from '@/lib/specialties'

interface PsychologistProfileProps {
  psychologist: PsychologistDetail
}

function formatAvailability(availability: Record<string, unknown> | null): string | null {
  if (!availability) return null
  const days = availability.days as string[] | undefined
  const hours = availability.hours as string | undefined
  if (!days || !hours) return null
  const dayMap: Record<string, string> = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
    friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
  }
  const shortDays = days.map((d) => dayMap[d] ?? d)
  if (shortDays.length > 2) {
    return `${shortDays[0]}–${shortDays[shortDays.length - 1]} ${hours}`
  }
  return `${shortDays.join(', ')} ${hours}`
}

export function PsychologistProfile({ psychologist }: PsychologistProfileProps) {
  const schedule = formatAvailability(psychologist.availability as Record<string, unknown> | null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header: avatar + info centered */}
      <div className="flex flex-col items-center text-center">
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
            <div data-testid="avatar-fallback" className="w-full h-full flex items-center justify-center text-3xl text-muted">
              👩‍⚕️
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <h1 className="text-2xl font-semibold">{psychologist.fullName}</h1>
            {psychologist.licenseVerified && (
              <span className="text-xs bg-success text-success-text px-2.5 py-0.5 rounded-full font-semibold">
                Verificada
              </span>
            )}
          </div>
          <p className="text-muted mt-0.5">{psychologist.displayName}</p>

          {psychologist.yearsExperience && psychologist.yearsExperience > 0 && (
            <p className="text-sm text-muted mt-1">{psychologist.yearsExperience} años de experiencia</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
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

        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {psychologist.licenseNumber && (
            <p>📜 Colegiatura {psychologist.licenseNumber}</p>
          )}
          {schedule && (
            <p>🗓️ {schedule}</p>
          )}
          {psychologist.languages.length > 0 && (
            <p>🌐 {psychologist.languages.join(' · ')}</p>
          )}
        </div>
      </div>

      {/* Biography */}
      {psychologist.biography && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2 text-center">Sobre mí</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-center">
            {psychologist.biography}
          </p>
        </section>
      )}

      {/* How it works card */}
      <div className="mt-8 bg-background-alt rounded-radius-card border border-border p-6">
        <h2 className="font-semibold text-lg mb-4 text-center">🌱 ¿Cómo funciona?</h2>

        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <span>Solicitas contacto con el psicólogo</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            <span>El psicólogo recibe tu solicitud y la acepta</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            <span>Recibirás un enlace directo a WhatsApp</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </span>
            <span>Hablan directamente — la plataforma no almacena conversaciones</span>
          </li>
        </ol>
      </div>

      {/* CTA */}
      <div className="mt-6">
        {psychologist.isAvailable ? (
          <Link
            href={`/solicitar/${psychologist.id}`}
            className="block w-full text-center px-6 py-4 rounded-radius-button font-semibold text-white transition-all animate-pulse"
            style={{
              backgroundColor: '#25d366',
              animationDuration: '3.5s',
            }}
          >
            <span className="inline-flex items-center gap-2">
              Solicitar contacto con {psychologist.displayName}
            </span>
          </Link>
        ) : (
          <div className="w-full text-center px-6 py-4 rounded-radius-button font-semibold bg-unavailable/20 text-muted">
            Vuelve pronto · {schedule ?? 'Horario: próximamente'}
          </div>
        )}
      </div>
    </div>
  )
}