// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PsychologistList } from './psychologist-list'
import type { PsychologistCardData } from '@/features/catalog/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    <img src={src} alt={alt} {...props} />,
}))

const mockPsychologist: PsychologistCardData = {
  id: 'psy-1',
  displayName: 'Ana López',
  avatarUrl: null,
  specialties: ['ansiedad'],
  languages: ['es'],
  isAvailable: true,
}

const mockPsychologists: PsychologistCardData[] = [
  mockPsychologist,
  { ...mockPsychologist, id: 'psy-2', displayName: 'Carlos Ruiz' },
  { ...mockPsychologist, id: 'psy-3', displayName: 'Laura Pérez' },
]

describe('PsychologistList', () => {
  it('renders 6 skeletons when isLoading is true', () => {
    const { container } = render(<PsychologistList psychologists={[]} isLoading={true} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6)
  })

  it('shows empty message when no psychologists', () => {
    render(<PsychologistList psychologists={[]} />)
    expect(screen.getByText('No hay psicólogos disponibles en este momento')).toBeDefined()
  })

  it('renders grid with 1 card', () => {
    render(<PsychologistList psychologists={[mockPsychologist]} />)
    expect(screen.getByText('Ana López')).toBeDefined()
  })

  it('renders grid with multiple cards', () => {
    render(<PsychologistList psychologists={mockPsychologists} />)
    expect(screen.getByText('Ana López')).toBeDefined()
    expect(screen.getByText('Carlos Ruiz')).toBeDefined()
    expect(screen.getByText('Laura Pérez')).toBeDefined()
  })
})
