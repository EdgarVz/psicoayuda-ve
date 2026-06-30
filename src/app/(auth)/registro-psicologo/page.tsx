import type { Metadata } from 'next'
import { RegistrationForm } from '@/features/psychologist-registration/components/registration-form'

export const metadata: Metadata = {
  title: 'Registro de psicólogo',
  description: 'Regístrate como psicólogo voluntario en PsicoAyuda VE',
}

export default function RegistroPsicologoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-center mb-2">Únete como psicólogo voluntario</h1>
      <p className="text-muted text-center mb-8">Completa tu registro para empezar a ayudar</p>
      <RegistrationForm />
    </div>
  )
}
