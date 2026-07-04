import { z } from 'zod'

const specialties = [
  'duelo',
  'ansiedad',
  'crisis_panico',
  'trauma',
  'apoyo_ninos',
  'apoyo_adolescentes',
  'depresion',
  'estres',
  'violencia',
  'adicciones',
] as const

export const appointmentRequestSchema = z.object({
  psychologist_id: z.string().uuid('Psicólogo inválido'),
  patient_age: z
    .number()
    .min(10, 'La edad mínima es 10 años')
    .max(120, 'Edad inválida'),
  reason: z
    .array(z.enum(specialties))
    .min(1, 'Selecciona al menos un motivo'),
  preferred_schedule: z.string().optional(),
  consent_granted: z.literal(true, { message: 'Debes aceptar los términos de consentimiento' }),
})

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>
