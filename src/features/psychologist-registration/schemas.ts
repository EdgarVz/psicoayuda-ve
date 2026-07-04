import { z } from 'zod'

const specialties = [
  'duelo', 'ansiedad', 'crisis_panico', 'trauma',
  'apoyo_ninos', 'apoyo_adolescentes', 'depresion',
  'estres', 'violencia', 'adicciones',
] as const

export const psychologistRegistrationSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  licenseNumber: z.string().min(4, 'Ingresa un número de colegiatura válido').max(50, 'Máximo 50 caracteres'),
  specialties: z.array(z.enum(specialties)).min(1, 'Selecciona al menos una especialidad'),
  languages: z.array(z.string()).optional().default(['español']),
  whatsappLink: z.string().url('Ingresa un enlace válido').regex(/^https:\/\/wa\.me\/\d+/, 'Debe ser un enlace de wa.me válido'),
  consentGranted: z.literal(true, { message: 'Debes aceptar los términos de consentimiento' }),
})

export type PsychologistRegistrationInput = z.infer<typeof psychologistRegistrationSchema>