'use client'

export default function Error({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Algo salió mal</h1>
      <p className="text-muted mb-6">Hubo un error inesperado. Por favor intenta de nuevo.</p>
      <button onClick={reset} className="bg-primary text-white px-6 py-3 rounded-radius-button hover:bg-primary-light transition-colors">
        Intentar de nuevo
      </button>
    </div>
  )
}
