// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RequestsList } from './requests-list'

vi.mock('@/features/appointments/actions', () => ({
  acceptRequest: vi.fn(),
  rejectRequest: vi.fn(),
}))

const patientRequests = [
  {
    id: 'req-1',
    psychologistName: 'Dra. María',
    psychologistId: 'psy-1',
    status: 'pending' as const,
    reason: ['ansiedad', 'estres'],
    createdAt: '2026-06-29T12:00:00Z',
    whatsappLink: null,
  },
  {
    id: 'req-2',
    psychologistName: 'Dr. José',
    psychologistId: 'psy-2',
    status: 'accepted' as const,
    reason: ['duelo'],
    createdAt: '2026-06-28T12:00:00Z',
    whatsappLink: 'https://wa.me/584141234567',
  },
]

const psychologistRequests = [
  {
    id: 'req-3',
    patientName: 'Paciente A',
    patientAge: 30,
    status: 'pending' as const,
    reason: ['ansiedad'],
    createdAt: '2026-06-29T12:00:00Z',
  },
]

describe('RequestsList (patient view)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders all requests', () => {
    render(<RequestsList requests={patientRequests} />)
    expect(screen.getByText('Dra. María')).toBeDefined()
    expect(screen.getByText('Dr. José')).toBeDefined()
  })

  it('shows status badges', () => {
    render(<RequestsList requests={patientRequests}  />)
    expect(screen.getByText('Pendiente')).toBeDefined()
    expect(screen.getByText('Aceptada')).toBeDefined()
  })

  it('shows WhatsApp button for accepted requests', () => {
    render(<RequestsList requests={patientRequests}  />)
    const waLink = screen.getByText('Contactar por WhatsApp')
    expect(waLink).toBeDefined()
    expect(waLink.closest('a')).toHaveProperty('href', 'https://wa.me/584141234567')
  })

  it('filters by tab', () => {
    render(<RequestsList requests={patientRequests}  />)
    fireEvent.click(screen.getByText('Aceptadas'))
    expect(screen.getByText('Dr. José')).toBeDefined()
    expect(screen.queryByText('Dra. María')).toBeNull()
  })
})

describe('RequestsList (psychologist view)', () => {
  it('renders patient info', () => {
    render(<RequestsList requests={psychologistRequests} />)
    expect(screen.getByText((content) => content.includes('Paciente A'))).toBeDefined()
    expect(screen.getByText((content) => content.includes('30 años'))).toBeDefined()
  })

  it('shows accept/reject buttons for pending', () => {
    render(<RequestsList requests={psychologistRequests} />)
    expect(screen.getByText('Aceptar')).toBeDefined()
    expect(screen.getByText('Rechazar')).toBeDefined()
  })

  it('shows specialties as labels', () => {
    render(<RequestsList requests={psychologistRequests} />)
    expect(screen.getByText('Ansiedad')).toBeDefined()
  })
})

describe('RequestsList (empty state)', () => {
  it('shows empty message when no requests match filter', () => {
    render(<RequestsList requests={[]}  />)
    expect(screen.getByText('No hay solicitudes en esta categoría')).toBeDefined()
  })
})