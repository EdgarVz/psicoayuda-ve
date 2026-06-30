// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  },
}))
import { PatientDashboard } from './patient-dashboard'

const mockRequests = [
  {
    id: 'req-1',
    psychologistName: 'Dra. María',
    psychologistId: 'psy-1',
    status: 'pending' as const,
    reason: ['ansiedad'],
    createdAt: '2026-06-29T12:00:00Z',
    whatsappLink: null,
  },
]

const mockStats = { total: 1, pending: 1, accepted: 0, rejected: 0 }

describe('PatientDashboard', () => {
  it('renders title in Spanish', () => {
    render(<PatientDashboard requests={mockRequests} stats={mockStats} />)
    expect(screen.getByText('Mis espacios')).toBeDefined()
  })

  it('renders StatsCards and RequestsList', () => {
    render(<PatientDashboard requests={mockRequests} stats={mockStats} />)
    expect(screen.getByText('Dra. María')).toBeDefined()
    expect(screen.getAllByText('1')).toHaveLength(2)
  })
})