'use client'

const SPECIALTIES = [
  { value: 'duelo', label: 'Duelo' },
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'crisis_panico', label: 'Crisis de pánico' },
  { value: 'trauma', label: 'Trauma' },
  { value: 'apoyo_ninos', label: 'Apoyo niños' },
  { value: 'apoyo_adolescentes', label: 'Apoyo adolescentes' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'estres', label: 'Estrés' },
  { value: 'violencia', label: 'Violencia' },
  { value: 'adicciones', label: 'Adicciones' },
]

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
      {SPECIALTIES.map(({ value, label }) => (
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
