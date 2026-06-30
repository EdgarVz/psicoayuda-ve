// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}))

vi.mock('@/features/psychologist-registration/actions', () => ({
  registerPsychologist: vi.fn(),
}))

import { registerPsychologist } from '@/features/psychologist-registration/actions'
import { RegistrationForm } from './registration-form'

const mockRegister = vi.mocked(registerPsychologist)

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all fields', () => {
    render(<RegistrationForm />)

    expect(screen.getByText('Completa tu registro')).toBeDefined()
    expect(screen.getByText('Nombre completo')).toBeDefined()
    expect(screen.getByText('Número de colegiatura')).toBeDefined()
    expect(screen.getByText('Especialidades')).toBeDefined()
  })

  it('shows specialty pills', () => {
    render(<RegistrationForm />)

    expect(screen.getByText('Ansiedad')).toBeDefined()
    expect(screen.getByText('Duelo')).toBeDefined()
    expect(screen.getByText('Depresión')).toBeDefined()
  })

  it('submits the form successfully', async () => {
    mockRegister.mockResolvedValue({ success: true })

    render(<RegistrationForm />)

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'María García' } })
    fireEvent.change(screen.getByLabelText('Número de colegiatura'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Ansiedad'))
    fireEvent.click(screen.getByText('Acepto los términos de consentimiento'))
    fireEvent.click(screen.getByText('Completar registro'))

    await screen.findByText('Registro completado')
    expect(screen.getByText('Bienvenido a PsicoAyuda VE')).toBeDefined()
  })

  it('shows error from server', async () => {
    mockRegister.mockResolvedValue({ error: 'Error de prueba' })

    render(<RegistrationForm />)

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'María García' } })
    fireEvent.change(screen.getByLabelText('Número de colegiatura'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Ansiedad'))
    fireEvent.click(screen.getByText('Acepto los términos de consentimiento'))
    fireEvent.click(screen.getByText('Completar registro'))

    await screen.findByText('Error de prueba')
  })

  it('shows validation error for short name', async () => {
    render(<RegistrationForm />)

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText('Número de colegiatura'), { target: { value: '12345' } })
    fireEvent.click(screen.getByText('Ansiedad'))
    fireEvent.click(screen.getByText('Acepto los términos de consentimiento'))
    fireEvent.click(screen.getByText('Completar registro'))

    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeDefined()
    expect(mockRegister).not.toHaveBeenCalled()
  })
})
