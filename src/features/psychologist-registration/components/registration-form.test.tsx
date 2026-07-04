import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RegistrationForm } from './registration-form'

vi.mock('@/features/psychologist-registration/actions', () => ({
  registerPsychologist: vi.fn(),
}))

describe('RegistrationForm', () => {
  it('renders the form fields', () => {
    render(<RegistrationForm />)
    expect(screen.getByLabelText('Nombre completo')).toBeDefined()
    expect(screen.getByLabelText('Número de colegiatura')).toBeDefined()
    expect(screen.getByLabelText('Enlace de WhatsApp')).toBeDefined()
  })

  it('renders specialty pills', () => {
    render(<RegistrationForm />)
    expect(screen.getByText('Ansiedad')).toBeDefined()
    expect(screen.getByText('Depresión')).toBeDefined()
  })

  it('renders the consent checkbox with id and htmlFor', () => {
    render(<RegistrationForm />)
    const checkbox = screen.getByRole('checkbox', {
      name: /Certifico que soy/i,
    })
    expect(checkbox).toHaveAttribute('id', 'consent-checkbox')
    const label = checkbox.closest('label')
    expect(label).toHaveAttribute('for', 'consent-checkbox')
  })

  it('renders submit button disabled by default', () => {
    render(<RegistrationForm />)
    const button = screen.getByText('Registrarme como psicólogo')
    expect(button).toBeDisabled()
  })

  it('renders specialty pills togglable', () => {
    render(<RegistrationForm />)
    const specialtyButton = screen.getByText('Ansiedad')
    expect(specialtyButton.className).toContain('bg-white')
  })
})