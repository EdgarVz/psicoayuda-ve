import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-6">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="bg-primary text-white px-6 py-3 rounded-radius-button hover:bg-primary-light transition-colors">
        Volver al inicio
      </Link>
    </div>
  )
}
