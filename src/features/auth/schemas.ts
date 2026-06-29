import { z } from 'zod'

export const magicLinkSchema = z.object({
  email: z
    .string()
    .email('Ingresa un correo electrónico válido'),
})

export type MagicLinkInput = z.infer<typeof magicLinkSchema>

export const psychologistSignupSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  full_name: z.string().min(3, 'Ingresa tu nombre completo').max(100, 'Máximo 100 caracteres'),
  license_number: z.string().min(3, 'Ingresa tu número de colegiado'),
})

export type PsychologistSignupInput = z.infer<typeof psychologistSignupSchema>
