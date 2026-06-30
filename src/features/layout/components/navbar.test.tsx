// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from './navbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar', () => {
  it('renders "Dashboard" when isLoggedIn is true', () => {
    render(<Navbar isLoggedIn={true} />)
    expect(screen.getByText('Dashboard')).toBeDefined()
  })

  it('renders "Ingresar" when isLoggedIn is false', () => {
    render(<Navbar isLoggedIn={false} />)
    expect(screen.getByText('Ingresar')).toBeDefined()
  })

  it('renders "Ingresar" by default when isLoggedIn is not provided', () => {
    render(<Navbar />)
    expect(screen.getByText('Ingresar')).toBeDefined()
  })
})
