import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('merges Tailwind classes correctly (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})