import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqAccordion } from './faq-accordion'

const items = [
  { question: 'Pregunta 1', answer: 'Respuesta 1' },
  { question: 'Pregunta 2', answer: 'Respuesta 2' },
]

describe('FaqAccordion', () => {
  it('renders all questions', () => {
    render(<FaqAccordion items={items} />)
    expect(screen.getByText('Pregunta 1')).toBeDefined()
    expect(screen.getByText('Pregunta 2')).toBeDefined()
  })

  it('toggles answer on click', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={items} />)
    await user.click(screen.getByText('Pregunta 1'))
    expect(screen.getByText('Respuesta 1')).toBeDefined()
  })

  it('closes previous answer when opening new one', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={items} />)
    await user.click(screen.getByText('Pregunta 1'))
    expect(screen.getByText('Respuesta 1')).toBeDefined()
    await user.click(screen.getByText('Pregunta 2'))
    expect(screen.queryByText('Respuesta 1')).toBeNull()
    expect(screen.getByText('Respuesta 2')).toBeDefined()
  })
})
