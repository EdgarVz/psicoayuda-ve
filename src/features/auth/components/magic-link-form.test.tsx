// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MagicLinkForm } from './magic-link-form'

vi.mock('@/features/auth/actions', () => ({
  sendMagicLink: vi.fn(),
}))

import { sendMagicLink } from '@/features/auth/actions'

const mockSend = vi.mocked(sendMagicLink)

describe('MagicLinkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input and submit button in idle state', () => {
    render(<MagicLinkForm />)
    expect(
      screen.getByPlaceholderText('tucorreo@ejemplo.com')
    ).toBeDefined()
    expect(screen.getByText('Enviar enlace mágico')).toBeDefined()
  })

  it('calls sendMagicLink with the email on submit', async () => {
    mockSend.mockResolvedValue({ success: true })
    render(<MagicLinkForm />)

    fireEvent.change(
      screen.getByPlaceholderText('tucorreo@ejemplo.com'),
      { target: { value: 'test@example.com' } }
    )
    fireEvent.click(screen.getByText('Enviar enlace mágico'))

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
    })
  })

  it('shows sending state with disabled button', () => {
    mockSend.mockReturnValue(new Promise<{ success: true }>(() => {}))
    render(<MagicLinkForm />)

    fireEvent.change(
      screen.getByPlaceholderText('tucorreo@ejemplo.com'),
      { target: { value: 'test@example.com' } }
    )
    fireEvent.click(screen.getByText('Enviar enlace mágico'))

    expect(screen.getByText('Enviando...')).toBeDefined()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows sent message after successful submission', async () => {
    mockSend.mockResolvedValue({ success: true })
    render(<MagicLinkForm />)

    fireEvent.change(
      screen.getByPlaceholderText('tucorreo@ejemplo.com'),
      { target: { value: 'test@example.com' } }
    )
    fireEvent.click(screen.getByText('Enviar enlace mágico'))

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo')).toBeDefined()
    })
  })

  it('shows error message when sendMagicLink fails', async () => {
    mockSend.mockResolvedValue({ error: 'Correo inválido' })
    render(<MagicLinkForm />)

    fireEvent.change(
      screen.getByPlaceholderText('tucorreo@ejemplo.com'),
      { target: { value: 'bad@example.com' } }
    )
    fireEvent.click(screen.getByText('Enviar enlace mágico'))

    await waitFor(() => {
      expect(screen.getByText('Correo inválido')).toBeDefined()
    })
  })
})
