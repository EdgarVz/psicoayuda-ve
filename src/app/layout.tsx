import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { headers } from 'next/headers'
import './globals.css'
import { Toaster } from 'sonner'

const geist = localFont({
  src: [
    { path: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2', style: 'normal' },
  ],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { template: '%s · PsicoAyuda VE', default: 'PsicoAyuda VE — Apoyo psicológico en Venezuela' },
  description: 'Conectamos pacientes con psicólogos voluntarios verificados en Venezuela. Apoyo emocional gratuito vía WhatsApp.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? ''

  return (
    <html lang="es" className={geist.variable}>
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
