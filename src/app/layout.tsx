import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { headers } from 'next/headers'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: { template: '%s · PsicoAyuda VE', default: 'PsicoAyuda VE — Apoyo psicológico en Venezuela' },
  description: 'Conectamos pacientes con psicólogos voluntarios verificados en Venezuela. Apoyo emocional gratuito vía WhatsApp.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? ''

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
