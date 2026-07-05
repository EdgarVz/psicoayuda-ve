import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { RegistrationForm } from '@/features/psychologist-registration/components/registration-form'

export const metadata: Metadata = {
  title: 'Registro de psicólogo',
  description: 'Regístrate como psicólogo voluntario en PsicoAyuda VE',
}

export default async function RegistroPsicologoPage() {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Regístrate como psicólogo</h1>
        <p className="text-muted-foreground">
          Completa tus datos para aparecer en nuestro directorio de psicólogos voluntarios
        </p>
      </div>

      <RegistrationForm userLoggedIn={isLoggedIn} />
    </div>
  )
}