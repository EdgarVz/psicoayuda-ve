// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequestStatus } from './request-status'
import { WhatsAppButton } from './whatsapp-button'

const encodedMessage = encodeURIComponent(
  'Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico.',
)

describe('WhatsAppButton', () => {
  it('renders WhatsApp link with encoded message when link provided', () => {
    render(<WhatsAppButton whatsappLink="https://wa.me/584141234567" />)
    const link = screen.getByText('Contactar por WhatsApp')
    expect(link.closest('a')).toHaveAttribute(
      'href',
      `https://wa.me/584141234567?text=${encodedMessage}`,
    )
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
  })

  it('shows fallback text when whatsappLink is null', () => {
    render(<WhatsAppButton whatsappLink={null} />)
    expect(
      screen.getByText(
        'El psicólogo aún no ha configurado su enlace de WhatsApp.',
      ),
    ).toBeDefined()
    expect(screen.queryByText('Contactar por WhatsApp')).toBeNull()
  })
})

describe('RequestStatus', () => {
  describe('pending', () => {
    const pendingProps = {
      status: 'pending' as const,
      psychologistName: 'María García',
      requestId: 'req-123',
    }

    it('shows "Solicitud enviada" and psychologist name', () => {
      render(<RequestStatus {...pendingProps} />)
      expect(screen.getByText('Solicitud enviada')).toBeDefined()
      expect(screen.getAllByText('María García').length).toBeGreaterThanOrEqual(1)
    })

    it('shows formatted request ID (7 chars uppercase)', () => {
      render(<RequestStatus {...pendingProps} />)
      expect(screen.getByText('Solicitud #REQ-123')).toBeDefined()
    })

    it('does not render request ID section when requestId is omitted', () => {
      render(
        <RequestStatus
          status="pending"
          psychologistName="María García"
        />
      )
      expect(screen.queryByText(/Solicitud #/)).toBeNull()
    })
  })

  describe('accepted', () => {
    const baseAccepted = {
      status: 'accepted' as const,
      psychologistName: 'María García',
    }

    it('shows "Solicitud aceptada" and WhatsApp button when link provided', () => {
      render(
        <RequestStatus
          {...baseAccepted}
          whatsappLink="https://wa.me/584141234567"
        />
      )
      expect(screen.getByText('Solicitud aceptada')).toBeDefined()
      const waLink = screen.getByText('Contactar por WhatsApp')
      expect(waLink.closest('a')).toHaveAttribute(
        'href',
        `https://wa.me/584141234567?text=${encodedMessage}`,
      )
    })

    it('shows default WhatsApp message', () => {
      render(
        <RequestStatus
          {...baseAccepted}
          whatsappLink="https://wa.me/584141234567"
        />
      )
      expect(
        screen.getByText(
          '“Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico.”',
        ),
      ).toBeDefined()
    })

    it('shows fallback when whatsappLink is not provided', () => {
      render(<RequestStatus {...baseAccepted} />)
      expect(
        screen.getByText(
          'El psicólogo aún no ha configurado su enlace de WhatsApp.',
        ),
      ).toBeDefined()
      expect(screen.queryByText('Contactar por WhatsApp')).toBeNull()
    })
  })

  describe('rejected', () => {
    it('shows "Solicitud no aceptada" and link to /psicologos', () => {
      render(
        <RequestStatus
          status="rejected"
          psychologistName="María García"
        />
      )
      expect(
        screen.getByText('Solicitud no aceptada')
      ).toBeDefined()
      const link = screen.getByText('Ver otros psicólogos')
      expect(link.closest('a')).toHaveAttribute(
        'href',
        '/psicologos'
      )
    })
  })
})
