import type { Metadata } from 'next'
import { MagicLinkForm } from '@/features/auth/components/magic-link-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a PsicoAyuda VE con tu correo electrónico',
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Bienvenido de vuelta</h1>
        <p className="text-muted">Ingresa tu correo para recibir un enlace mágico</p>
      </div>

      <MagicLinkForm />

      <p className="text-center text-sm text-muted mt-8">
        ¿Eres psicólogo?{' '}
        <a href="/registro-psicologo" className="text-primary hover:underline">
          Regístrate aquí
        </a>
      </p>
    </div>
  )
}
