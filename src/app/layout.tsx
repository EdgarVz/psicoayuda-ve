import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: { template: '%s · PsicoAyuda VE', default: 'PsicoAyuda VE — Apoyo psicológico en Venezuela' },
  description: 'Conectamos pacientes con psicólogos voluntarios verificados en Venezuela. Apoyo emocional gratuito vía WhatsApp.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
