// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PsychologistProfile } from './psychologist-profile'
import type { PsychologistDetail } from '@/features/psychologist/queries'

const base: PsychologistDetail = {
  id: 'psy-1',
  displayName: 'maria_psi',
  fullName: 'María García',
  avatarUrl: null,
  biography: 'Psicóloga clínica.',
  specialties: ['ansiedad'],
  languages: ['español'],
  isAvailable: true,
  availability: null,
  licenseVerified: true,
  licenseNumber: '12345',
  yearsExperience: 10,
}

describe('PsychologistProfile', () => {
  it('renders fullName and displayName', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('María García')).toBeDefined()
    expect(screen.getByText('maria_psi')).toBeDefined()
  })

  it('shows verified badge when licenseVerified is true', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('Verificada')).toBeDefined()
  })

  it('does not show verified badge when licenseVerified is false', () => {
    render(
      <PsychologistProfile
        psychologist={{ ...base, licenseVerified: false }}
      />
    )
    expect(screen.queryByText('Verificada')).toBeNull()
  })

  it('renders specialty tags with SPECIALTY_LABELS', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('Ansiedad')).toBeDefined()
  })

  it('shows "Disponible ahora" when isAvailable is true', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('Disponible ahora')).toBeDefined()
  })

  it('shows "No disponible temporalmente" when isAvailable is false', () => {
    render(
      <PsychologistProfile
        psychologist={{ ...base, isAvailable: false }}
      />
    )
    expect(screen.getByText('No disponible temporalmente')).toBeDefined()
  })

  it('renders years of experience when yearsExperience > 0', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('10 años de experiencia')).toBeDefined()
  })

  it('does not render years of experience when yearsExperience is null', () => {
    render(
      <PsychologistProfile
        psychologist={{ ...base, yearsExperience: null }}
      />
    )
    expect(screen.queryByText('años de experiencia')).toBeNull()
  })

  it('renders CTA link to /solicitar/[id] when available', () => {
    render(<PsychologistProfile psychologist={base} />)
    const cta = screen.getByText((content) =>
      content.includes('Solicitar contacto con maria_psi')
    )
    const link = cta.closest('a')
    expect(link).toHaveAttribute('href', '/solicitar/psy-1')
  })

  it('shows "Vuelve pronto" when not available', () => {
    render(
      <PsychologistProfile
        psychologist={{ ...base, isAvailable: false }}
      />
    )
    expect(
      screen.getByText((content) => content.includes('Vuelve pronto'))
    ).toBeDefined()
  })

  it('renders biography when present', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('Psicóloga clínica.')).toBeDefined()
  })

  it('does not render biography section when absent', () => {
    render(
      <PsychologistProfile
        psychologist={{ ...base, biography: null }}
      />
    )
    expect(screen.queryByText('Sobre mí')).toBeNull()
  })

  it('renders avatar fallback with first letter of fullName', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('M')).toBeDefined()
  })

  it('renders "¿Cómo funciona?" card with 4 numbered steps', () => {
    render(<PsychologistProfile psychologist={base} />)
    expect(screen.getByText('🌱 ¿Cómo funciona?')).toBeDefined()
    expect(
      screen.getByText('Solicitas contacto con el psicólogo')
    ).toBeDefined()
    expect(
      screen.getByText(
        'El psicólogo recibe tu solicitud y la acepta'
      )
    ).toBeDefined()
    expect(
      screen.getByText('Recibirás un enlace directo a WhatsApp')
    ).toBeDefined()
    expect(
      screen.getByText(
        'Hablan directamente — la plataforma no almacena conversaciones'
      )
    ).toBeDefined()
  })
})
