# Arquitectura — PsicoAyuda VE

## Stack tecnológico

| Capa | Tecnología | Versión | Proveedor |
|------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 16 | Open source |
| Lenguaje | TypeScript | 5 | — |
| Base de datos | PostgreSQL | — | Supabase (free tier) |
| ORM | Cliente Supabase nativo | — | Supabase |
| Auth | Supabase Auth (Magic Links) | — | Supabase (free tier) |
| Almacenamiento | Supabase Storage | — | Supabase (free tier, 1 GB) |
| Rate limiting | In-memory Map (`lib/rate-limit.ts`) | — | Sin dependencias externas |
| Emails | Resend | — | Free tier (100 emails/día) |
| Monitoreo | Sentry | 9 | Condicional |
| Validación | Zod | 4 | Open source |
| State management | Zustand | 5 | Open source |
| CSS | Tailwind CSS + shadcn/ui | 4 | Open source |
| CI/CD | GitHub Actions | — | Free para repos públicos |
| Hosting | Vercel | — | Free tier (serverless) |
| Font files | Geist | — | Self-hosted via `geist/font/sans` |

## Tipografía
- Body/UI: **Geist** (Variable, self-hosted via `next/font/local`)

## Modelo de datos

### Tablas principales

#### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | References auth.users |
| role | user_role | 'psychologist' \| 'patient' |
| display_name | text | Nombre o apodo |
| avatar_url | text | Foto de perfil |
| timezone | text | Zona horaria (ej: 'America/Caracas') |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Auth (Magic Links)

- **Método**: `supabase.auth.signInWithOtp()` con `emailRedirectTo`
- **SMTP requerido**: Supabase Auth necesita un SMTP configurado para enviar los correos.
- **Proveedor**: Resend u otro SMTP (SendGrid, Brevo, Mailersend)
- **Configuración del SMTP** (en Supabase Dashboard → Authentication → Settings → SMTP Settings):

  | Campo | Ejemplo (Resend) |
  |-------|-----------------|
  | SMTP Host | `smtp.resend.com` |
  | SMTP Port | `587` |
  | Username | `resend` |
  | Password | `re_...` (API key de Resend) |
  | Sender | `noreply@tudominio.com` |

- `NEXT_PUBLIC_SITE_URL` debe coincidir con una URL permitida en Supabase Auth → URL Configuration → Redirect URLs
- La URL de redirección post-login se construye como `${origin}/dashboard`

#### `psychologist_profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | References profiles.id |
| full_name | text | Nombre completo |
| license_number | text | Número de colegiado |
| license_verified | boolean | Verificado por admin |
| license_document | text | URL Storage privado (título/carnet) |
| biography | text | Presentación profesional |
| specialties | text[] | Especialidades |
| languages | text[] | Idiomas |
| whatsapp_link | text | wa.me/enlace (oculto hasta aprobación) |
| availability | jsonb | Horarios disponibles |
| is_available | boolean | Disponible para solicitudes |
| years_experience | int | Años de experiencia profesional |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `appointment_requests`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| patient_id | UUID FK | References profiles.id (display_name vía JOIN) |
| psychologist_id | UUID FK | References psychologist_profiles.id |
| patient_age | int CHECK (10-120) | Edad |
| reason | specialty[] NOT NULL | Motivo de consulta |
| preferred_schedule | text | Preferencia horaria |
| status | request_status DEFAULT 'pending' | |
| consent_granted | boolean NOT NULL CHECK (consent_granted = true) | Forzado a nivel DB |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `admin_roles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| user_id | UUID FK | References auth.users |
| created_at | timestamptz | |

### Enums
- `user_role`: 'psychologist', 'patient'
- `request_status`: 'pending', 'accepted', 'rejected'
- `specialty`: 'duelo', 'ansiedad', 'crisis_panico', 'trauma', 'apoyo_ninos', 'apoyo_adolescentes', 'depresion', 'estres', 'violencia', 'adicciones'

## Flujo de conexión WhatsApp

1. Psicólogo se registra → carga título/licencia → admin verifica
2. Paciente busca psicólogo por especialidad/disponibilidad
3. Paciente solicita contacto → sistema crea `appointment_requests` (status: pending)
4. Sistema notifica al psicólogo vía email
5. Psicólogo acepta → status cambia a 'accepted'
6. Sistema revela wa.me link al paciente
7. Paciente hace clic → abre WhatsApp con mensaje predeterminado
8. Psicólogo y paciente continúan fuera de la plataforma

## Seguridad

- RLS en TODAS las tablas
- `service_role_key` solo en `lib/supabase/admin.ts`
- CSP nonce por request
- Rate limiting: 10 requests/10s por IP
- WhatsApp links protegidos: solo visibles tras aprobación
- Documentos de psicólogos en Storage privado

## Hosting

- Vercel (Hobby) — deploys automáticos desde `develop` y `main`
- Supabase (free tier) — PostgreSQL + Auth + Storage
- Resend (free tier) — notificaciones email

> **Nota:** Phase 8 implementado: `features/admin/actions.ts`, `features/admin/components/pending-verification.tsx`, `features/admin/components/verification-detail.tsx`.
> **Nota:** Phase 9 implementado: `features/psychologist-registration/schemas.ts`, `features/psychologist-registration/actions.ts`, `features/psychologist-registration/components/registration-form.tsx`, `app/(auth)/registro-psicologo/page.tsx`.
