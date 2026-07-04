import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditProfileForm } from './edit-profile-form'

vi.mock('@/features/psychologist/actions', () => ({
  updatePsychologistProfile: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const defaultData = {
  fullName: 'Dr. Test',
  biography: 'Psicólogo clínico',
  specialties: ['ansiedad'],
  languages: ['español'],
  whatsappLink: 'https://wa.me/584141234567',
  isAvailable: true,
  yearsExperience: 10,
}

describe('EditProfileForm', () => {
  it('renders with initial data', () => {
    render(<EditProfileForm initialData={defaultData} />)
    expect(screen.getByDisplayValue('Dr. Test')).toBeDefined()
    expect(screen.getByDisplayValue('Psicólogo clínico')).toBeDefined()
    expect(screen.getByDisplayValue('https://wa.me/584141234567')).toBeDefined()
  })

  it('toggles specialty selection', () => {
    render(<EditProfileForm initialData={defaultData} />)
    const specialtyBtn = screen.getByText('Ansiedad')
    expect(specialtyBtn.className).toContain('border-primary')
    fireEvent.click(specialtyBtn)
    expect(specialtyBtn.className).toContain('border-border')
  })
})
