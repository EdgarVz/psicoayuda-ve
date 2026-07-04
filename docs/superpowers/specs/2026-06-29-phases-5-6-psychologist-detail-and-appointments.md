# Phases 5 & 6: Psychologist Detail + Appointments

## Phase 5 — Psychologist Detail (`/psicologo/[id]`)

### Route
`/psicologo/[id]` — Server Component, UUID param. Public access (no auth required).

### Data
`getPsychologistById(id)` query joins `profiles` + `psychologist_profiles`. Returns `PsychologistDetail`: id, displayName, fullName, avatarUrl, biography, specialties[], languages[], isAvailable, availability, licenseVerified, licenseNumber.

### Components
- `PsychologistProfile`: avatar (Image fill unoptimized / initial fallback), name, verified badge, specialty tags, availability dot, biography, "¿Cómo funciona?" info card, CTA button → `/solicitar/[id]` (disabled if unavailable).
- Empty state: `notFound()` from query.

### SEO
`generateMetadata` with fullName + specialties.

### Files
- `src/features/psychologist/queries.ts`
- `src/features/psychologist/components/psychologist-profile.tsx`
- `src/app/(public)/psicologo/[id]/page.tsx`

---

## Phase 6 — Appointments

### Feature module: `src/features/appointments/`

### Types & Schemas
- `appointmentRequestSchema` (Zod): psychologist_id (uuid), patient_age (10-120), reason[] (enum of 10 specialties), preferred_schedule (optional string), consent_granted (literal true).
- `AppointmentRequest` / `AppointmentRequestStatus` types from Database.

### Actions (Server Actions)
1. `submitRequest(input)` — auth check → zod parse → insert appointment_request → revalidate → return id.
2. `acceptRequest(requestId)` — auth check → update status='accepted'.
3. `rejectRequest(requestId)` — auth check → update status='rejected'.

### Routes
1. `/solicitar/[id]` — request form. Checks psychologist is available + verified. Client component `RequestForm`: age input, reason checkboxes, schedule textarea, consent checkbox.
2. `/solicitud/[id]` — status page. `RequestStatusView`: pending/accepted/rejected states.

### Security
- RLS on `appointment_requests` allows insert for authenticated patient, read own requests.
- Consent enforced at DB level via CHECK constraint.
- WhatsApp link only revealed after psychologist accepts.

### Files
- `src/features/appointments/types.ts`, `schemas.ts`, `schemas.test.ts`
- `src/features/appointments/actions.ts`
- `src/features/appointments/components/request-form.tsx`
- `src/features/appointments/components/request-status.tsx`
- `src/app/(auth)/solicitar/[id]/page.tsx`
- `src/app/(auth)/solicitud/[id]/page.tsx`
