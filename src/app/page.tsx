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
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Un espacio para hablar<br />cuando más lo necesitas
        </h1>
        <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
          Conectamos pacientes con psicólogos voluntarios verificados en Venezuela.
          Apoyo emocional gratuito y confidencial vía WhatsApp.
        </p>
        <Link
          href="/psicologos"
          className="inline-block bg-primary text-white px-8 py-3 rounded-radius-button font-medium text-lg hover:bg-primary-light transition-colors"
        >
          Encontrar un psicólogo
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Psicólogos disponibles</h2>
        <PsychologistList psychologists={psychologists} />
      </section>
    </div>
  )
}
