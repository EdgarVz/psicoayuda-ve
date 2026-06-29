# Phases 5 & 6: Psychologist Detail + Appointments

## Phase 5 — Psychologist Detail (`/psicologo/[id]`)

### Route
`/psicologo/[id]` — Server Component, UUID param. Public access (no auth required).

### Data
`getPsychologistById(id)` query joins `profiles` + `psychologist_profiles`. Returns `PsychologistDetail`: id, displayName, fullName, avatarUrl, biography, specialties[], languages[], isAvailable, availability, licenseVerified, licenseNumber.

RLS allows public read on `profiles` WHERE `role = 'psychologist'` and on `psychologist_profiles` (already configured in Phase 2).

### Components
- `PsychologistProfile`: avatar (Image fill unoptimized / initial fallback), name, verified badge, specialty tags, availability dot, biography, "¿Cómo funciona?" info card, CTA button → `/solicitar/[id]` (disabled if unavailable).
- Loading state: parent page handles via React Suspense.
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

### Actions (Server Actions, `'use server'`)
1. `submitRequest(input)` — auth check → zod parse → insert appointment_request → revalidate → return id.
2. `acceptRequest(requestId)` — auth check → update status='accepted' WHERE psychologist match.
3. `rejectRequest(requestId)` — auth check → update status='rejected' WHERE psychologist match.

Notification to psychologist via Resend (optional, fallback null).

### Routes (both under `(auth)` layout)
1. `/solicitar/[id]` — request form. Checks psychologist is available + verified. Client component `RequestForm`: age input, reason checkboxes (10 specialties), schedule textarea, consent checkbox. Button disabled until consent + at least one reason. Submitting state, success → redirect to `/solicitud/[id]`.
2. `/solicitud/[id]` — status page. `RequestStatusView` component: 4 states — pending (waiting), accepted (WhatsApp link), rejected (link to catalog), null fallback.

### Security
- RLS on `appointment_requests` allows insert for authenticated patient, read own requests.
- Consent enforced at DB level via CHECK constraint.
- WhatsApp link only revealed after psychologist accepts.

### Files
- `src/features/appointments/types.ts`
- `src/features/appointments/schemas.ts`
- `src/features/appointments/schemas.test.ts`
- `src/features/appointments/actions.ts`
- `src/features/appointments/components/request-form.tsx`
- `src/features/appointments/components/request-status.tsx`
- `src/app/(auth)/solicitar/[id]/page.tsx`
- `src/app/(auth)/solicitud/[id]/page.tsx`

---

## Parallel Execution

Both phases are independent: Phase 5 is read-only (public), Phase 6 is write (auth-only). No shared files or components. Runnable as two Paseo subagents in parallel.

## Verification

```
npm run lint && npx tsc --noEmit && npm run build && npm test
```
