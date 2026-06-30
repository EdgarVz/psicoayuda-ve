// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PendingVerification } from './pending-verification'
import type { PendingPsychologist } from '@/features/admin/types'

vi.mock('@/features/admin/actions', () => ({
  verifyPsychologist: vi.fn(),
  rejectPsychologist: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockPsychologists: PendingPsychologist[] = [
  {
    id: 'psy-1',
    displayName: 'maria_psicologa',
    fullName: 'María García',
    licenseNumber: '12345',
    licenseDocument: null,
    avatarUrl: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
]

describe('PendingVerification', () => {
  it('renders empty state', () => {
    render(<PendingVerification psychologists={[]} />)
    expect(screen.getByText('No hay psicólogos pendientes de verificación')).toBeDefined()
  })

  it('renders psychologist rows', () => {
    render(<PendingVerification psychologists={mockPsychologists} />)
    expect(screen.getByText('María García')).toBeDefined()
    expect(screen.getByText('12345')).toBeDefined()
    expect(screen.getByText('Verificar')).toBeDefined()
    expect(screen.getByText('Rechazar')).toBeDefined()
  })
})
