import { describe, it, expect } from 'vitest'
import { SPECIALTY_LABELS } from './specialties'

describe('SPECIALTY_LABELS', () => {
  it('contains all 10 specialties', () => {
    expect(Object.keys(SPECIALTY_LABELS)).toHaveLength(10)
  })

  it('returns readable label for duelo', () => {
    expect(SPECIALTY_LABELS['duelo']).toBe('Duelo')
  })

  it('returns readable label for crisis_panico', () => {
    expect(SPECIALTY_LABELS['crisis_panico']).toBe('Crisis de pánico')
  })

  it('returns readable label for apoyo_ninos', () => {
    expect(SPECIALTY_LABELS['apoyo_ninos']).toBe('Apoyo a niños')
  })

  it('returns readable label for apoyo_adolescentes', () => {
    expect(SPECIALTY_LABELS['apoyo_adolescentes']).toBe('Apoyo a adolescentes')
  })

  it('returns undefined for unknown key', () => {
    expect(SPECIALTY_LABELS['unknown']).toBeUndefined()
  })

  it('all labels are non-empty strings', () => {
    for (const label of Object.values(SPECIALTY_LABELS)) {
      expect(label).toBeTruthy()
      expect(typeof label).toBe('string')
    }
  })
})