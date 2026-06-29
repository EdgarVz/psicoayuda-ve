import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Apoyo psicológico gratuito en Venezuela
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          Conectamos pacientes con psicólogos voluntarios verificados. Todo a través de WhatsApp, de forma segura y confidencial.
        </p>
        <Link
          href="/psicologos"
          className="inline-block bg-primary text-white px-8 py-4 rounded-radius-button text-lg font-medium hover:bg-primary-light transition-colors"
        >
          Buscar psicólogo
        </Link>
      </section>
    </div>
  )
}
