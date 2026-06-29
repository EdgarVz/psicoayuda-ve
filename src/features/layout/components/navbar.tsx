'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  isLoggedIn?: boolean
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary">
          PsicoAyuda VE
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/psicologos"
            className={`text-sm transition-colors ${pathname === '/psicologos' ? 'text-primary font-medium' : 'text-muted hover:text-foreground'}`}
          >
            Psicólogos
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-light transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-light transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
