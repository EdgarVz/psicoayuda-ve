# Four Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement rate limiting integration, WhatsApp link post-approval, edit psychologist profile, and E2E tests with network mocks.

**Architecture:** Four independent features. Tasks 1-3 can run in parallel (separate worktrees). Task 4 (E2E tests) depends on Task 2 (WhatsApp link) and existing features, so runs after.

**Tech Stack:** Next.js 16 (Turbopack), Supabase, Zod, Playwright, TypeScript, Vitest

---

### Task 1: Rate Limiting Integration

**Files:**
- Modify: `src/lib/rate-limit.ts` — add `withRateLimit` wrapper
- Create: `src/lib/rate-limit.test.ts`
- Modify: `src/features/psychologist-registration/actions.ts` — wrap `registerPsychologist`
- Modify: `src/features/auth/actions.ts` — wrap `sendMagicLink`
- Modify: `src/features/appointments/actions.ts` — wrap `submitRequest`
- Modify: `src/features/psychologist/actions.ts` — wrap `updatePsychologistProfile` (will be created in Task 3)

- [ ] **Step 1: Read existing rate-limit.ts**

Read `src/lib/rate-limit.ts` to understand current implementation.

- [ ] **Step 2: Write rate-limit.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withRateLimit } from './rate-limit'

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('calls action when under limit', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 3, windowMs: 60000, keyFn: () => 'ip-1' })
    const result = await wrapped()
    expect(result).toBe('ok')
    expect(action).toHaveBeenCalledOnce()
  })

  it('blocks when over limit', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 2, windowMs: 60000, keyFn: () => 'ip-2' })
    await wrapped()
    await wrapped()
    const result = await wrapped()
    expect(result).toEqual({ error: expect.stringContaining('Demasiadas solicitudes') })
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('resets after window expires', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 1, windowMs: 60000, keyFn: () => 'ip-3' })
    await wrapped()
    const blocked = await wrapped()
    expect(blocked).toEqual({ error: expect.stringContaining('Demasiadas solicitudes') })
    vi.advanceTimersByTime(60001)
    const result = await wrapped()
    expect(result).toBe('ok')
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('passes arguments to action', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 5, windowMs: 60000, keyFn: (...args) => args[0] })
    await wrapped('arg1', 'arg2')
    expect(action).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('returns remaining seconds in error message', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 1, windowMs: 60000, keyFn: () => 'ip-4' })
    await wrapped()
    const result = await wrapped()
    expect(result).toEqual({ error: expect.stringContaining('60') })
  })
})
```

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: FAIL (rate-limit.ts doesn't export `withRateLimit` yet)

- [ ] **Step 3: Add `withRateLimit` to rate-limit.ts**

```typescript
import { logger } from '@/lib/logger'

interface RateLimitEntry {
  count: number
  reset: number
}

const store = new Map<string, RateLimitEntry>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

export function getRemainingSeconds(key: string): number {
  const entry = store.get(key)
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.reset - Date.now()) / 1000))
}

// Periodically clean up stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.reset) store.delete(key)
  }
}, 60000)

export function withRateLimit<T extends (...args: unknown[]) => unknown>(
  action: T,
  options: { limit: number; windowMs: number; keyFn: (...args: Parameters<T>) => string },
): (...args: Parameters<T>) => Promise<ReturnType<T> | { error: string }> {
  return async (...args: Parameters<T>) => {
    const key = options.keyFn(...args)
    if (!rateLimit(key, options.limit, options.windowMs)) {
      const remaining = getRemainingSeconds(key)
      logger.warn(`Rate limit exceeded for key: ${key}`)
      return { error: `Demasiadas solicitudes. Intenta de nuevo en ${remaining} segundos.` } as { error: string }
    }
    return action(...args) as ReturnType<T>
  }
}
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: PASS

- [ ] **Step 5: Wrap registerPsychologist with rate limit**

In `src/features/psychologist-registration/actions.ts`, add at top:

```typescript
import { withRateLimit } from '@/lib/rate-limit'

export const registerPsychologist = withRateLimit(
  async (input: PsychologistRegistrationInput) => {
    // existing implementation
  },
  {
    limit: 5,
    windowMs: 60000,
    keyFn: () => 'register-psychologist',
  },
)
```

Note: Keep the original function body, just wrap the export.

- [ ] **Step 6: Wrap sendMagicLink with rate limit**

In `src/features/auth/actions.ts`, wrap `sendMagicLink`:

```typescript
import { withRateLimit } from '@/lib/rate-limit'

export const sendMagicLink = withRateLimit(
  async (email: string) => {
    // existing implementation
  },
  {
    limit: 3,
    windowMs: 60000,
    keyFn: (email: string) => `magic-link:${email}`,
  },
)
```

- [ ] **Step 7: Wrap submitRequest with rate limit**

In `src/features/appointments/actions.ts`, wrap `submitRequest`:

```typescript
import { withRateLimit } from '@/lib/rate-limit'
import { createServerSupabase } from '@/lib/supabase/server'

export const submitRequest = withRateLimit(
  async (input: AppointmentRequestInput) => {
    // existing implementation
  },
  {
    limit: 10,
    windowMs: 60000,
    keyFn: async () => {
      const supabase = await createServerSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      return `submit-request:${user?.id ?? 'anonymous'}`
    },
  },
)
```

Wait — `withRateLimit` expects a sync `keyFn` but getting the user ID is async. We need to handle this. The wrapper should accept `keyFn` that returns `string | Promise<string>`.

Update `withRateLimit` in rate-limit.ts:

```typescript
export function withRateLimit<T extends (...args: unknown[]) => unknown>(
  action: T,
  options: { limit: number; windowMs: number; keyFn: (...args: Parameters<T>) => string | Promise<string> },
): (...args: Parameters<T>) => Promise<ReturnType<T> | { error: string }> {
  return async (...args: Parameters<T>) => {
    const key = await options.keyFn(...args)
    // rest same
  }
}
```

Then in `submitRequest`:

```typescript
export const submitRequest = withRateLimit(
  async (input) => { /* existing body */ },
  {
    limit: 10,
    windowMs: 60000,
    keyFn: async () => {
      const supabase = await createServerSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      return `submit-request:${user?.id ?? 'anonymous'}`
    },
  },
)
```

- [ ] **Step 8: Run all tests**

Run: `npm test`
Expected: All 165+ existing tests pass + new rate-limit tests pass

- [ ] **Step 9: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts src/features/psychologist-registration/actions.ts src/features/auth/actions.ts src/features/appointments/actions.ts
git commit -m "feat: integrate rate limiting into Server Actions"
```

---

### Task 2: WhatsApp Link Post-Approval

**Files:**
- Modify: `src/features/appointments/components/request-status.tsx`
- Modify: `src/app/(auth)/solicitud/[id]/page.tsx` (if needed)
- Modify: `src/features/appointments/queries.ts` (if a new query is needed)
- Create: `src/features/appointments/components/whatsapp-button.tsx`
- Create: `src/features/appointments/components/request-status.test.tsx` (update/expand)

- [ ] **Step 1: Read current request-status.tsx and solicitud page**

Read `src/features/appointments/components/request-status.tsx` to understand current rendering.
Read `src/app/(auth)/solicitud/[id]/page.tsx` to understand data flow.

- [ ] **Step 2: Create whatsapp-button.tsx**

```typescript
'use client'

interface WhatsAppButtonProps {
  whatsappLink: string | null
}

export function WhatsAppButton({ whatsappLink }: WhatsAppButtonProps) {
  if (!whatsappLink) {
    return (
      <p className="text-sm text-muted-foreground">
        El psicólogo aún no ha configurado su enlace de WhatsApp.
      </p>
    )
  }

  const message = encodeURIComponent(
    'Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico.',
  )
  const fullUrl = `${whatsappLink}?text=${message}`

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-radius-button font-semibold text-white transition-all hover:opacity-90"
      style={{ backgroundColor: '#25d366' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Contactar por WhatsApp
    </a>
  )
}
```

- [ ] **Step 3: Update request-status.tsx to show WhatsApp button on accepted**

In `request-status.tsx`, import and render `WhatsAppButton` when status is 'accepted'. Pass `whatsappLink` as a prop from the parent page.

- [ ] **Step 4: Update solicitud/[id]/page.tsx to query whatsapp_link**

The page already queries `appointment_requests`. When status is 'accepted', also query `psychologist_profiles.whatsapp_link` using `createServerSupabase()` (the RLS policy `whatsapp_on_accepted` will allow it since the patient has an accepted request).

```typescript
// In solicitud/[id]/page.tsx, after getting the request:
let whatsappLink: string | null = null
if (request.status === 'accepted') {
  const supabase = await createServerSupabase()
  const { data: psyProfile } = await supabase
    .from('psychologist_profiles')
    .select('whatsapp_link')
    .eq('id', request.psychologist_id)
    .single()
  if (psyProfile) {
    whatsappLink = psyProfile.whatsapp_link
  }
}
```

- [ ] **Step 5: Write/update test for request-status.tsx**

Update `src/features/appointments/components/request-status.test.tsx` (or create if doesn't exist) to test that WhatsApp button appears when status is 'accepted' and `whatsappLink` is provided.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/appointments/components/ src/app/\(auth\)/solicitud/
git commit -m "feat: show WhatsApp link on accepted appointment request"
```

---

### Task 3: Edit Psychologist Profile

**Files:**
- Create: `src/features/psychologist/schemas.ts`
- Create: `src/features/psychologist/actions.ts`
- Create: `src/features/psychologist/components/edit-profile-form.tsx`
- Create: `src/app/(auth)/dashboard/editar-perfil/page.tsx`
- Modify: `src/app/(auth)/dashboard/page.tsx` (add nav link)
- Create: `src/features/psychologist/components/edit-profile-form.test.tsx`

- [ ] **Step 1: Create psychologist schemas.ts**

```typescript
import { z } from 'zod'
import { SPECIALTIES } from '@/lib/specialties'

const specialtiesType = SPECIALTIES.map((s) => s.id) as [string, ...string[]]

export const PsychologistProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  biography: z.string().max(2000, 'La biografía no puede exceder 2000 caracteres').optional(),
  specialties: z.array(z.enum(specialtiesType)).min(1, 'Selecciona al menos una especialidad'),
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
```

- [ ] **Step 2: Create psychologist actions.ts**

```typescript
'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { PsychologistProfileUpdateSchema } from '@/features/psychologist/schemas'
import { withRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

async function updatePsychologistProfileImpl(input: PsychologistProfileUpdateInput) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const parsed = PsychologistProfileUpdateSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const adminSupabase = createAdminSupabase()

  const updateData: Record<string, unknown> = {
    full_name: parsed.data.fullName,
    specialties: parsed.data.specialties,
    languages: parsed.data.languages,
  }

  if (parsed.data.biography !== undefined) {
    updateData.biography = parsed.data.biography || null
  }
  if (parsed.data.whatsappLink !== undefined) {
    updateData.whatsapp_link = parsed.data.whatsappLink || null
  }
  if (parsed.data.isAvailable !== undefined) {
    updateData.is_available = parsed.data.isAvailable
  }
  if (parsed.data.yearsExperience !== undefined) {
    updateData.years_experience = parsed.data.yearsExperience
  }

  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    logger.error('Failed to update psychologist profile', error)
    return { error: 'Error al actualizar el perfil' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/psicologo/${user.id}`)
  return { success: true }
}

export const updatePsychologistProfile = withRateLimit(
  updatePsychologistProfileImpl,
  {
    limit: 10,
    windowMs: 60000,
    keyFn: async () => {
      const supabase = await createServerSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      return `update-profile:${user?.id ?? 'anonymous'}`
    },
  },
)
```

- [ ] **Step 3: Create edit-profile-form.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updatePsychologistProfile } from '@/features/psychologist/actions'
import { SPECIALTY_LABELS } from '@/lib/specialties'
import type { PsychologistProfileUpdateInput } from '@/features/psychologist/schemas'

interface EditProfileFormProps {
  initialData: {
    fullName: string
    biography: string | null
    specialties: string[]
    languages: string[]
    whatsappLink: string | null
    isAvailable: boolean
    yearsExperience: number | null
  }
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fullName, setFullName] = useState(initialData.fullName)
  const [biography, setBiography] = useState(initialData.biography ?? '')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialData.specialties)
  const [languages, setLanguages] = useState(initialData.languages.join(', '))
  const [whatsappLink, setWhatsappLink] = useState(initialData.whatsappLink ?? '')
  const [isAvailable, setIsAvailable] = useState(initialData.isAvailable)
  const [yearsExperience, setYearsExperience] = useState(initialData.yearsExperience?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input: PsychologistProfileUpdateInput = {
      fullName,
      biography: biography || undefined,
      specialties: selectedSpecialties as PsychologistProfileUpdateInput['specialties'],
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      whatsappLink: whatsappLink || undefined,
      isAvailable,
      yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
    }

    const result = await updatePsychologistProfile(input)

    if ('error' in result) {
      setError(result.error)
      toast.error(result.error)
    } else {
      toast.success('Perfil actualizado correctamente')
      router.refresh()
    }

    setIsSubmitting(false)
  }

  function toggleSpecialty(specialtyId: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((s) => s !== specialtyId)
        : [...prev, specialtyId],
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-error-bg text-error-text p-3 rounded-radius-card text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div>
        <label htmlFor="biography" className="block text-sm font-medium mb-1">
          Biografía
        </label>
        <textarea
          id="biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div>
        <span className="block text-sm font-medium mb-2">Especialidades</span>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_LABELS.map((specialty) => {
            const isSelected = selectedSpecialties.includes(specialty.id)
            return (
              <button
                key={specialty.id}
                type="button"
                onClick={() => toggleSpecialty(specialty.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-text'
                    : 'bg-background-alt text-muted-foreground hover:bg-background-alt/80'
                }`}
              >
                {specialty.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="languages" className="block text-sm font-medium mb-1">
          Idiomas (separados por coma)
        </label>
        <input
          id="languages"
          type="text"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="español, inglés"
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div>
        <label htmlFor="whatsappLink" className="block text-sm font-medium mb-1">
          Enlace de WhatsApp
        </label>
        <input
          id="whatsappLink"
          type="text"
          value={whatsappLink}
          onChange={(e) => setWhatsappLink(e.target.value)}
          placeholder="https://wa.me/584141234567"
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="isAvailable" className="text-sm font-medium">
          Disponible para recibir solicitudes
        </label>
        <input
          id="isAvailable"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-4 h-4"
        />
      </div>

      <div>
        <label htmlFor="yearsExperience" className="block text-sm font-medium mb-1">
          Años de experiencia
        </label>
        <input
          id="yearsExperience"
          type="number"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          min={0}
          max={70}
          className="w-full px-3 py-2 border border-border rounded-radius-input bg-background"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 rounded-radius-button font-semibold text-white bg-primary transition-all hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Create page.tsx for editar-perfil**

```typescript
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/features/psychologist/components/edit-profile-form'

export default async function EditarPerfilPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'psychologist') redirect('/dashboard')

  const { data: psyProfile } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!psyProfile) redirect('/dashboard')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Editar perfil</h1>
      <EditProfileForm
        initialData={{
          fullName: psyProfile.full_name,
          biography: psyProfile.biography,
          specialties: psyProfile.specialties ?? [],
          languages: psyProfile.languages ?? [],
          whatsappLink: psyProfile.whatsapp_link,
          isAvailable: psyProfile.is_available ?? true,
          yearsExperience: psyProfile.years_experience,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 5: Add nav link in dashboard page**

In `src/app/(auth)/dashboard/page.tsx`, add a link to `/dashboard/editar-perfil` in the psychologist dashboard section.

- [ ] **Step 6: Create edit-profile-form.test.tsx**

Test form renders with initial data, toggle specialty works, submit calls action.

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditProfileForm } from './edit-profile-form'

vi.mock('@/features/psychologist/actions', () => ({
  updatePsychologistProfile: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const defaultData = {
  fullName: 'Dr. Test',
  biography: 'Psicólogo clínico',
  specialties: ['ansiedad'],
  languages: ['español'],
  whatsappLink: 'https://wa.me/584141234567',
  isAvailable: true,
  yearsExperience: 10,
}

describe('EditProfileForm', () => {
  it('renders with initial data', () => {
    render(<EditProfileForm initialData={defaultData} />)
    expect(screen.getByDisplayValue('Dr. Test')).toBeDefined()
    expect(screen.getByDisplayValue('Psicólogo clínico')).toBeDefined()
    expect(screen.getByDisplayValue('https://wa.me/584141234567')).toBeDefined()
  })

  it('toggles specialty selection', () => {
    render(<EditProfileForm initialData={defaultData} />)
    const specialtyBtn = screen.getByText('Ansiedad')
    expect(specialtyBtn.className).toContain('bg-primary')
    fireEvent.click(specialtyBtn)
    expect(specialtyBtn.className).toContain('bg-background-alt')
  })
})
```

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/features/psychologist/ src/app/\(auth\)/dashboard/editar-perfil/
git commit -m "feat: add edit psychologist profile page"
```

---

### Task 4: E2E Tests with Network Mocks

**Files:**
- Create: `e2e/fixtures/psychologists.json`
- Create: `e2e/fixtures/psychologist-detail.json`
- Create: `e2e/fixtures/auth-session.json`
- Create: `e2e/fixtures/requests.json`
- Create: `e2e/catalog.spec.ts`
- Create: `e2e/registration.spec.ts`
- Create: `e2e/login.spec.ts`
- Create: `e2e/request-status.spec.ts`
- Modify: `e2e/smoke.spec.ts` (refactor or keep as-is)

- [ ] **Step 1: Create fixtures**

Create `e2e/fixtures/psychologists.json`:

```json
{
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "full_name": "Carlos Mendoza",
      "license_verified": true,
      "specialties": ["ansiedad", "depresion"],
      "is_available": true,
      "years_experience": 10,
      "profiles": {
        "display_name": "Dr. Carlos Mendoza",
        "avatar_url": null
      }
    },
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "full_name": "Ana Lucía Rivas",
      "license_verified": true,
      "specialties": ["ansiedad", "crisis_panico"],
      "is_available": true,
      "years_experience": 8,
      "profiles": {
        "display_name": "Dra. Ana Lucía Rivas",
        "avatar_url": null
      }
    }
  ]
}
```

Create `e2e/fixtures/psychologist-detail.json` (single psychologist with full detail).

Create `e2e/fixtures/auth-session.json`:
```json
{
  "access_token": "mock-token",
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com"
  }
}
```

Create `e2e/fixtures/requests.json`:
```json
{
  "data": [
    {
      "id": "req-1",
      "psychologist_id": "00000000-0000-0000-0000-000000000002",
      "status": "pending",
      "created_at": "2026-07-01T00:00:00Z"
    },
    {
      "id": "req-2",
      "psychologist_id": "00000000-0000-0000-0000-000000000003",
      "status": "accepted",
      "created_at": "2026-07-01T00:00:00Z"
    }
  ]
}
```

- [ ] **Step 2: Create catalog.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import psychologists from './fixtures/psychologists.json' assert { type: 'json' }

test.describe('Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/psychologist_profiles**', async (route) => {
      await route.fulfill({ json: psychologists })
    })
    await page.goto('/psicologos')
  })

  test('loads and displays psychologists', async ({ page }) => {
    await expect(page.getByText('Carlos Mendoza')).toBeVisible()
    await expect(page.getByText('Ana Lucía Rivas')).toBeVisible()
  })

  test('filter by specialty works', async ({ page }) => {
    await page.getByText('Ansiedad').click()
    await expect(page.getByText('Carlos Mendoza')).toBeVisible()
  })
})
```

- [ ] **Step 3: Create registration.spec.ts**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Psychologist Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registro-psicologo')
  })

  test('form renders with all fields', async ({ page }) => {
    await expect(page.getByText('Regístrate como psicólogo voluntario')).toBeVisible()
    await expect(page.getByLabel('Nombre completo')).toBeVisible()
    await expect(page.getByLabel('Número de colegiatura')).toBeVisible()
    await expect(page.getByText('Acepto los términos y condiciones')).toBeVisible()
  })

  test('shows validation error on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /registrarse/i }).click()
    await expect(page.getByText(/obligatorio/i)).toBeVisible()
  })
})
```

- [ ] **Step 4: Create login.spec.ts**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders magic link form', async ({ page }) => {
    await expect(page.getByText(/enlace mágico/i)).toBeVisible()
    await expect(page.getByLabel(/correo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible()
  })

  test('has link to registration', async ({ page }) => {
    await expect(page.getByText(/registr.*psicólogo/i)).toBeVisible()
  })
})
```

- [ ] **Step 5: Create request-status.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import requests from './fixtures/requests.json' assert { type: 'json' }

test.describe('Request Status', () => {
  test('shows WhatsApp button when accepted', async ({ page }) => {
    await page.route('**/rest/v1/appointment_requests**', async (route) => {
      await route.fulfill({ json: { data: [requests.data[1]] } })
    })
    await page.route('**/rest/v1/psychologist_profiles**', async (route) => {
      await route.fulfill({
        json: { data: [{ whatsapp_link: 'https://wa.me/584141234567' }] },
      })
    })
    await page.goto('/solicitud/req-2')
    await expect(page.getByText('Contactar por WhatsApp')).toBeVisible()
  })

  test('shows pending status when not accepted', async ({ page }) => {
    await page.route('**/rest/v1/appointment_requests**', async (route) => {
      await route.fulfill({ json: { data: [requests.data[0]] } })
    })
    await page.goto('/solicitud/req-1')
    await expect(page.getByText('Contactar por WhatsApp')).not.toBeVisible()
  })
})
```

- [ ] **Step 6: Configure Playwright to handle the mocked sessions**

Update `playwright.config.ts` if needed. The tests should work with mock routes and don't require Supabase running.

- [ ] **Step 7: Run E2E tests**

Run: `npm run test:e2e`
Expected: PASS (or at minimum, the mocked tests pass; some existing tests may fail without Supabase running — adjust accordingly)

- [ ] **Step 8: Commit**

```bash
git add e2e/
git commit -m "test(e2e): add network-mocked E2E tests for catalog, registration, login, request status"
```

---

## Post-Implementation: Documentation Updates

**Files:**
- Modify: `BITACORA.md` — add session entry
- Modify: `SMOKE-TEST.md` — update coverage table
- Modify: `ARCHITECTURE.md` — add `/dashboard/editar-perfil` route

- [ ] **Update BITACORA.md** with new session entry
- [ ] **Update SMOKE-TEST.md**:
  - Item 8: WhatsApp link → 🔵 Unit test + ✅ E2E
  - Item 12: Rate limiting → 🔵 Unit test
  - Add: Rate limiting for Server Actions
  - Add: Edit profile from dashboard
- [ ] **Update ARCHITECTURE.md**: add `/dashboard/editar-perfil` to route list
