import { z } from 'zod'
import { SPECIALTY_LABELS } from '@/lib/specialties'

const specialtyIds = Object.keys(SPECIALTY_LABELS) as [string, ...string[]]

export const PsychologistProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  biography: z.string().max(2000, 'La biografía no puede exceder 2000 caracteres').optional(),
  specialties: z.array(z.enum(specialtyIds)).min(1, 'Selecciona al menos una especialidad'),
  languages: z.array(z.string()).min(1, 'Selecciona al menos un idioma'),
  whatsappLink: z
    .string()
    .regex(/^https:\/\/wa\.me\/\d{7,15}$/, 'El enlace de WhatsApp no es válido')
    .optional()
    .or(z.literal('')),
  isAvailable: z.boolean().optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
})

export type PsychologistProfileUpdateInput = z.infer<typeof PsychologistProfileUpdateSchema>
