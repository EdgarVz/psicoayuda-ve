// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCards } from './stats-cards'

const mockStats = { total: 10, pending: 4, accepted: 3, rejected: 3 }

describe('StatsCards', () => {
  it('renders all 4 stat cards', () => {
    render(<StatsCards stats={mockStats} />)

    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('4')).toBeDefined()
    expect(screen.getAllByText('3')).toHaveLength(2)
  })

  it('renders labels in Spanish', () => {
    render(<StatsCards stats={mockStats} />)

    expect(screen.getByText('Total')).toBeDefined()
    expect(screen.getByText('Pendientes')).toBeDefined()
    expect(screen.getByText('Aceptadas')).toBeDefined()
    expect(screen.getByText('Rechazadas')).toBeDefined()
  })

  it('handles all-zero stats', () => {
    render(<StatsCards stats={{ total: 0, pending: 0, accepted: 0, rejected: 0 }} />)

    expect(screen.getAllByText('0')).toHaveLength(4)
  })
})