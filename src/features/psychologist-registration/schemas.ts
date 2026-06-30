import { z } from 'zod'

export const psychologistRegistrationSchema = z.object({
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Nombre demasiado largo'),
  license_number: z.string().min(3, 'Ingresa tu número de colegiatura'),
  specialties: z.array(z.string()).min(1, 'Selecciona al menos una especialidad'),
  consent_verified: z.literal(true as const, { message: 'Debes aceptar los términos de consentimiento' }),
})

export type PsychologistRegistrationInput = z.infer<typeof psychologistRegistrationSchema>
