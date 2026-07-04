// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpecialtyFilter } from './specialty-filter'

describe('SpecialtyFilter', () => {
  it('renders "Todas" plus 10 specialty buttons', () => {
    render(<SpecialtyFilter selected={[]} onChange={() => {}} />)
    expect(screen.getByText('Todas')).toBeDefined()
    expect(screen.getByText('Duelo')).toBeDefined()
    expect(screen.getByText('Ansiedad')).toBeDefined()
    expect(screen.getByText('Crisis de pánico')).toBeDefined()
    expect(screen.getByText('Trauma')).toBeDefined()
    expect(screen.getByText('Apoyo niños')).toBeDefined()
    expect(screen.getByText('Apoyo adolescentes')).toBeDefined()
    expect(screen.getByText('Depresión')).toBeDefined()
    expect(screen.getByText('Estrés')).toBeDefined()
    expect(screen.getByText('Violencia')).toBeDefined()
    expect(screen.getByText('Adicciones')).toBeDefined()
    expect(screen.getAllByRole('button')).toHaveLength(11)
  })

  it('highlights "Todas" when selected is empty', () => {
    render(<SpecialtyFilter selected={[]} onChange={() => {}} />)
    const todas = screen.getByText('Todas')
    expect(todas.className).toContain('bg-primary')
  })

  it('calls onChange([value]) when clicking a specialty', () => {
    const onChange = vi.fn()
    render(<SpecialtyFilter selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Ansiedad'))
    expect(onChange).toHaveBeenCalledWith(['ansiedad'])
  })

  it('calls onChange([]) when clicking an already-selected specialty', () => {
    const onChange = vi.fn()
    render(<SpecialtyFilter selected={['ansiedad']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Ansiedad'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('calls onChange([]) when clicking "Todas"', () => {
    const onChange = vi.fn()
    render(<SpecialtyFilter selected={['ansiedad']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Todas'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('selected specialty has bg-primary class', () => {
    render(<SpecialtyFilter selected={['duelo']} onChange={() => {}} />)
    const duelo = screen.getByText('Duelo')
    expect(duelo.className).toContain('bg-primary')
  })
})
