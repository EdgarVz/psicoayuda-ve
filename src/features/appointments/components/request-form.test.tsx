import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequestForm } from './request-form'

describe('RequestForm', () => {
  const defaultProps = {
    psychologistId: 'psy-123',
    psychologistName: 'María García',
  }

  it('renders the consent checkbox with id and htmlFor association', () => {
    render(<RequestForm {...defaultProps} />)

    const checkbox = screen.getByRole('checkbox', {
      name: /Entiendo que esta plataforma es solo un medio de contacto/i,
    })

    expect(checkbox).toHaveAttribute('id', 'consent-checkbox')

    const label = checkbox.closest('label')
    expect(label).toHaveAttribute('for', 'consent-checkbox')
  })
})
