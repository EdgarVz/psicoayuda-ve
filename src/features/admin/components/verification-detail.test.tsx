// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VerificationDetail } from './verification-detail'

const mockPsychologist = {
  id: 'psy-1',
  displayName: 'maria_psicologa',
  fullName: 'María García',
  licenseNumber: '12345',
  licenseDocument: null,
  avatarUrl: null,
  createdAt: '2026-01-15T10:00:00Z',
}

describe('VerificationDetail', () => {
  it('renders psychologist info', () => {
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        onReject={vi.fn()}
      />
    )
    expect(screen.getByText('María García')).toBeDefined()
    expect(screen.getByText('maria_psicologa')).toBeDefined()
    expect(screen.getByText('12345')).toBeDefined()
  })

  it('calls onVerify when Verificar is clicked', () => {
    const onVerify = vi.fn()
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={onVerify}
        onReject={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Verificar'))
    expect(onVerify).toHaveBeenCalledWith('psy-1')
  })

  it('calls onReject when Rechazar is clicked', () => {
    const onReject = vi.fn()
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        onReject={onReject}
      />
    )
    fireEvent.click(screen.getByText('Rechazar'))
    expect(onReject).toHaveBeenCalledWith('psy-1')
  })
})
