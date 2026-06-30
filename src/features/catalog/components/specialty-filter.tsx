'use client'

import { SPECIALTY_LABELS } from '@/lib/specialties'

interface SpecialtyFilterProps {
  selected: string[]
  onChange: (specialties: string[]) => void
}

export function SpecialtyFilter({ selected, onChange }: SpecialtyFilterProps) {
  function toggle(specialty: string) {
    if (selected.includes(specialty)) {
      onChange(selected.filter((s) => s !== specialty))
    } else {
      onChange([...selected, specialty])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
          selected.length === 0
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
        }`}
      >
        Todas
      </button>
      {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            selected.includes(value)
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
