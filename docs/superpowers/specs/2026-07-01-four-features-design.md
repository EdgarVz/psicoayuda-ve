# Four Features Design — Rate Limiting, WhatsApp Link, Edit Profile, E2E Mocks

> **Date:** 2026-07-01
> **Status:** Approved

## 1. Rate Limiting Integration

### Problem
`lib/rate-limit.ts` implements an in-memory rate limiter (`Map<string, { count, reset }>`) but is not integrated into any Server Action or API route. All mutation endpoints are unprotected.

### Solution
Create a reusable `withRateLimit` wrapper that decorates any Server Action with rate limit enforcement.

### Limits
| Scope | Limit | Window | Key |
|-------|-------|--------|-----|
| Registro psicólogo | 5 | 60s | IP (`x-forwarded-for`) |
| Magic Link login | 3 | 60s | email |
| Solicitar cita | 10 | 60s | user ID |
| Editar perfil | 10 | 60s | user ID |
| General (API routes) | 30 | 60s | IP |

### API
```typescript
function withRateLimit<T>(
  action: (...args: unknown[]) => Promise<T>,
  options: { limit: number; windowMs: number; keyFn: (...args: unknown[]) => string }
): (...args: unknown[]) => Promise<T | { error: string }>
```

When limit exceeded: return `{ error: 'Demasiadas solicitudes. Intenta de nuevo en X segundos.' }` with status 429 semantics.

### Files
- Modify: `lib/rate-limit.ts` — add `withRateLimit` wrapper
- Modify: `features/psychologist-registration/actions.ts` — wrap `registerPsychologist`
- Modify: `features/auth/actions.ts` — wrap `sendMagicLink`
- Modify: `features/appointments/actions.ts` — wrap `submitRequest`
- Create: `lib/rate-limit.test.ts`

### No API route changes needed
Only Server Actions. No middleware/traditional API route changes.

---

## 2. WhatsApp Link Post-Approval

### Problem
When a psychologist accepts an appointment request, the patient should see the psychologist's WhatsApp link to initiate contact. Currently the `/solicitud/[id]` page shows status but no WhatsApp link on acceptance.

### Background
RLS policy `whatsapp_on_accepted` already exists:
- Patient can read `psychologist_profiles.whatsapp_link` IF there's an accepted request linking them
- Psychologist can always read their own link
- Admin can read any link

So the DB security is already correct. Only frontend work needed.

### Solution
In `/solicitud/[id]`, when `request.status === 'accepted'`, query the psychologist's `whatsapp_link` and render a WhatsApp button.

### Components
- Modify: `features/appointments/components/request-status.tsx` — add WhatsApp section
- The page already loads `psychologist_id` via the request query

### WhatsApp button
- Green background (`#25d366`), white text
- Text: "Contactar por WhatsApp"
- Icon: lucide `Phone` or WhatsApp SVG
- Opens `https://wa.me/<number>?text=Hola%2C%20vengo%20de%20PsicoAyuda%20VE.%20Solicito%20apoyo%20psicol%C3%B3gico.`
- Pulse animation matching existing pattern on psychologist profile page

### Flow
1. Patient opens `/solicitud/[id]`
2. Queries `appointment_requests` by ID → gets `psychologist_id` + `status`
3. If `status === 'accepted'`: query `psychologist_profiles.whatsapp_link` for that psychologist
4. Render WhatsApp link button
5. If `status !== 'accepted'`: show current status badges (no change)

### Edge cases
- `whatsapp_link` is NULL → show fallback text "El psicólogo aún no ha configurado su enlace"
- Status changes from pending→accepted → auto-refresh (existing polling or on mount)

---

## 3. Edit Psychologist Profile

### Problem
Psychologists have no way to edit their profile after registration. Fields like biography, availability, specialties may need updates.

### Database schema (psychologist_profiles)
| Column | Type | Editable? |
|--------|------|-----------|
| id | uuid | NO |
| full_name | text | YES |
| license_number | text | NO (immutable after verification) |
| license_document | text | NO |
| license_verified | boolean | NO (admin only) |
| biography | text | YES |
| specialties | specialty[] | YES |
| languages | text[] | YES |
| whatsapp_link | text | YES |
| availability | jsonb | YES |
| is_available | boolean | YES |
| years_experience | int | YES |
| created_at | timestamptz | NO |
| updated_at | timestamptz | NO |

### Solution

**Route:** `/dashboard/editar-perfil` (under `(auth)` group, protected by middleware)

**Server Action:** `updatePsychologistProfile()`
- Zod schema: editable fields + validation
- Uses `createAdminSupabase()` to bypass RLS for update (same pattern as registration)
- Calls `revalidatePath('/dashboard')` and `revalidatePath('/psicologo/[id]')`

**Component:** `edit-profile-form.tsx` in `features/psychologist/components/`

**Form fields:**
- `fullName` → text input
- `biography` → textarea
- `specialties` → pill toggle multi-select (same as registration form)
- `languages` → text array input
- `whatsappLink` → text input (wa.me URL validation)
- `availability` → JSON editor or structured days/hours
- `isAvailable` → toggle switch
- `yearsExperience` → number input

### Loading state
Page queries `psychologist_profiles` for the current user (via `createServerSupabase()`), pre-fills the form.

### Error handling
- Zod validation errors per field (same pattern as registration form)
- Server error: toast with `sonner`

### Files
- Create: `features/psychologist/actions.ts` — `updatePsychologistProfile()`
- Create: `features/psychologist/schemas.ts` — `PsychologistProfileUpdateSchema`
- Create: `features/psychologist/components/edit-profile-form.tsx`
- Create: `app/(auth)/dashboard/editar-perfil/page.tsx`
- Modify: `app/(auth)/dashboard/layout.tsx` or dashboard page — add nav link
- Create: `features/psychologist/components/edit-profile-form.test.tsx`
- Create: `features/psychologist/actions.test.ts`

### RLS note
Uses `createAdminSupabase()` for the UPDATE, same pattern as `registerPsychologist`. The RLS policy `psychologist_own_update` (which allows `auth.uid() = id`) could also work, but using admin client is consistent with the existing pattern and avoids potential RLS edge cases with the server client.

---

## 4. E2E Tests with Network Mocks

### Problem
Current E2E tests in `e2e/smoke.spec.ts` (catalog, registration, login, CSP) require Supabase seed data and a running project. Tests fail without a live Supabase instance.

### Solution
Use Playwright's `page.route()` to intercept Supabase REST API calls and return mock fixtures. No external dependency.

### Architecture
- Create `e2e/fixtures/` directory with JSON files representing Supabase responses
- In `page.route()`, match URL patterns like `**/rest/v1/psychologist_profiles**` and return fixture data
- Use `e2e/global-setup.ts` (or `test.use({ storageState })`) for auth mocking (simulate logged-in state)

### Fixtures needed
| Fixture | File | Purpose |
|---------|------|---------|
| Psychologist list | `e2e/fixtures/psychologists.json` | Catalog page |
| Single psychologist | `e2e/fixtures/psychologist-detail.json` | Profile detail |
| Appointment requests | `e2e/fixtures/requests.json` | Dashboard, solicitud status |
| Auth session | `e2e/fixtures/auth-session.json` | Simulate logged-in state |

### Approach: `page.route()` per test
Each test sets up its own mocks before navigation:

```typescript
await page.route('**/rest/v1/psychologist_profiles**', async route => {
  await route.fulfill({ json: mockPsychologists })
})
```

### Prefer approach: Global mock with per-test overrides
- `e2e/global-setup.ts` sets default mocks
- Individual tests can override specific endpoints via `page.route()` with higher priority

### Tests to create/modify
- `e2e/catalog.spec.ts` — catalog loads, filter works, click psychologist
- `e2e/registration.spec.ts` — form renders, validation works, submit disabled
- `e2e/login.spec.ts` — magic link form renders, invalid email validation
- `e2e/request-status.spec.ts` — pending/accepted states, WhatsApp link on accepted

### Files
- Create: `e2e/fixtures/psychologists.json`
- Create: `e2e/fixtures/psychologist-detail.json`
- Create: `e2e/fixtures/auth-session.json`
- Create: `e2e/catalog.spec.ts`
- Create: `e2e/registration.spec.ts`
- Create: `e2e/login.spec.ts`
- Create: `e2e/request-status.spec.ts`
- Modify: `e2e/smoke.spec.ts` (refactor to use fixtures or remove in favor of per-feature specs)

---

## Documentation updates

After implementation, update:

- `SMOKE-TEST.md` — update coverage table with new items
- `BITACORA.md` — add session entry for these 4 features
- `ARCHITECTURE.md` — add `/dashboard/editar-perfil` route entry
- `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md` — update checklist
