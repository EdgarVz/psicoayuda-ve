import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { template: '%s · Admin PsicoAyuda VE', default: 'Admin · PsicoAyuda VE' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-admin-sidebar text-white p-6 flex flex-col gap-6">
        <Link href="/admin" className="text-lg font-semibold">PsicoAyuda VE</Link>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="text-white/80 hover:text-white transition-colors">Verificaciones</Link>
          <Link href="/" className="text-white/80 hover:text-white transition-colors">Volver al sitio</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  )
}
