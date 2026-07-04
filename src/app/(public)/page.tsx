import Link from 'next/link'
import { getHomePsychologists } from '@/features/catalog/queries'
import { PsychologistList } from '@/features/catalog/components/psychologist-list'

export const metadata = {
  title: 'PsicoAyuda VE — Apoyo psicológico en Venezuela',
  description: 'Conectamos pacientes con psicólogos voluntarios verificados en Venezuela. Apoyo emocional gratuito vía WhatsApp.',
}

export default async function HomePage() {
  const psychologists = await getHomePsychologists()

  return (
    <div>
      <section className="bg-gradient-to-br from-[#E8F4F0] via-[#FDF8F3] to-[#FDF8F3] text-center px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center text-5xl md:text-6xl">
            🌿
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Un espacio para hablar<br />cuando más lo necesitas
          </h1>
          <p className="text-muted text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Te conectamos con psicólogos voluntarios verificados en Venezuela.
            Gratuito, confidencial y sin complicaciones. No estás solo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/psicologos"
              className="inline-block bg-primary text-white px-8 py-3.5 rounded-radius-button font-medium text-lg hover:bg-primary-dark transition-colors"
            >
              Encontrar un psicólogo
            </Link>
            <Link
              href="/registro-psicologo"
              className="inline-block bg-white text-primary px-8 py-3.5 rounded-radius-button font-medium text-lg border border-border hover:bg-background-alt transition-colors"
            >
              Soy psicólogo · Quiero ayudar
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Psicólogos disponibles ahora</h2>
        <PsychologistList psychologists={psychologists} />
      </section>
    </div>
  )
}
