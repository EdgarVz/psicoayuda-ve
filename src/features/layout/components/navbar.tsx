'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, clearAuthCookie } from '@/features/auth/actions'

interface NavbarProps {
  isLoggedIn?: boolean
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await signOut()
    await clearAuthCookie()
    router.push('/')
  }, [router])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          <span className="text-primary">Psico</span><span style={{ color: '#D4A574' }}>Ayuda</span><span className="text-primary"> VE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/psicologos"
            className={`text-sm transition-colors ${pathname === '/psicologos' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Psicólogos
          </Link>
          <Link
            href="/registro-psicologo"
            className={`text-sm transition-colors ${pathname === '/registro-psicologo' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Soy Psicólogo
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-dark transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-danger hover:text-danger/80 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/psicologos"
                className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-dark transition-colors"
              >
                Buscar espacio
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2 items-center justify-center"
          aria-label="Menú"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <span className="block text-lg text-muted-foreground leading-none">✕</span>
          ) : (
            <>
              <span className="block w-5 h-0.5 bg-muted-foreground rounded" />
              <span className="block w-5 h-0.5 bg-muted-foreground rounded" />
              <span className="block w-5 h-0.5 bg-muted-foreground rounded" />
            </>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <Link
            href="/psicologos"
            className={`block text-sm transition-colors ${pathname === '/psicologos' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Psicólogos
          </Link>
          <Link
            href="/registro-psicologo"
            className={`block text-sm transition-colors ${pathname === '/registro-psicologo' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Soy Psicólogo
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-dark transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="block w-full text-sm text-danger hover:text-danger/80 transition-colors text-left"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ingresar
              </Link>
              <Link
                href="/psicologos"
                className="block text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-dark transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Buscar espacio
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}