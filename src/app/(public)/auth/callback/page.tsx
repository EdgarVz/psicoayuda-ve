'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Error al iniciar sesión. Intenta de nuevo.')
        return
      }

      const res = await fetch('/api/auth/set-cookie', { method: 'POST' })

      if (!res.ok) {
        setError('Error al establecer la sesión.')
        return
      }

      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      router.push(adminRole ? '/admin' : '/dashboard')
      router.refresh()
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center p-8 max-w-md">
          <p className="text-danger mb-4">{error}</p>
          <a href="/login" className="text-primary underline">
            Volver al login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground text-lg">Iniciando sesión...</p>
    </div>
  )
}
