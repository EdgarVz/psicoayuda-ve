// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  },
}))
import { PsychologistDashboard } from './psychologist-dashboard'

const mockRequests = [
  {
    id: 'req-1',
    patientName: 'Paciente A',
    patientAge: 30,
    status: 'pending' as const,
    reason: ['ansiedad'],
    createdAt: '2026-06-29T12:00:00Z',
  },
]

const mockStats = { total: 1, pending: 1, accepted: 0, rejected: 0 }

describe('PsychologistDashboard', () => {
  it('renders title in Spanish', () => {
    render(<PsychologistDashboard requests={mockRequests} stats={mockStats} />)
    expect(screen.getByText('Solicitudes recibidas')).toBeDefined()
  })

  it('renders StatsCards and RequestsList', () => {
    render(<PsychologistDashboard requests={mockRequests} stats={mockStats} />)
    expect(screen.getByText((c) => c.includes('Paciente A'))).toBeDefined()
    expect(screen.getAllByText('1')).toHaveLength(2)
  })
})