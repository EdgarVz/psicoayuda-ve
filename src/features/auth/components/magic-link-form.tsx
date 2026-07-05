'use client'

import { useState } from 'react'
import { sendMagicLink } from '@/features/auth/actions'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')

    const result = await sendMagicLink({ email })

    if (result.error) {
      setError(result.error)
      setState('error')
      return
    }

    setState('sent')
  }

  if (state === 'sent') {
    return (
      <div className="text-center p-8 bg-background-alt rounded-radius-card">
        <p className="text-lg font-medium mb-2">Revisa tu correo</p>
        <p className="text-muted-foreground">Te enviamos un enlace mágico para iniciar sesión.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          required
          disabled={state === 'sending'}
          className="w-full px-4 py-3 rounded-radius-button border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full bg-primary text-white py-3 rounded-radius-button font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        {state === 'sending' ? 'Enviando...' : 'Enviar enlace mágico'}
      </button>
    </form>
  )
}
