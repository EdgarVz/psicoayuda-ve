// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PsychologistCard, PsychologistCardSkeleton } from './psychologist-card'
import type { PsychologistCardData } from '@/features/catalog/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    <img src={src} alt={alt} {...props} />,
}))

const basePsychologist: PsychologistCardData = {
  id: 'psy-1',
  displayName: 'María García',
  avatarUrl: null,
  specialties: ['ansiedad', 'duelo'],
  languages: ['es'],
  isAvailable: true,
}

describe('PsychologistCard', () => {
  it('renders displayName', () => {
    render(<PsychologistCard psychologist={basePsychologist} />)
    expect(screen.getByText('María García')).toBeDefined()
  })

  it('renders specialty badges with SPECIALTY_LABELS', () => {
    render(<PsychologistCard psychologist={basePsychologist} />)
    expect(screen.getByText('Ansiedad')).toBeDefined()
    expect(screen.getByText('Duelo')).toBeDefined()
  })

  it('shows female doctor emoji fallback when avatarUrl is null', () => {
    const { container } = render(<PsychologistCard psychologist={basePsychologist} />)
    expect(container.textContent).toContain('👩‍⚕️')
  })

  it('renders img when avatarUrl is provided', () => {
    const withAvatar = { ...basePsychologist, avatarUrl: '/avatars/maria.jpg' }
    render(<PsychologistCard psychologist={withAvatar} />)
    const img = screen.getByAltText('María García') as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('/avatars/maria.jpg')
  })

  it('shows "Disponible ahora" and active link when isAvailable is true', () => {
    render(<PsychologistCard psychologist={basePsychologist} />)
    expect(screen.getByText('Disponible ahora')).toBeDefined()
    const link = screen.getByText('Conectar con María García')
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/psicologo/psy-1')
  })

  it('shows "No disponible" and disabled state when isAvailable is false', () => {
    const unavailable = { ...basePsychologist, isAvailable: false }
    render(<PsychologistCard psychologist={unavailable} />)
    expect(screen.getByText('No disponible')).toBeDefined()
    const link = screen.getByText('No disponible temporalmente')
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/psicologo/psy-1')
  })
})

describe('PsychologistCardSkeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<PsychologistCardSkeleton />)
    const firstChild = container.firstChild as HTMLElement
    expect(firstChild.className).toContain('animate-pulse')
  })
})
