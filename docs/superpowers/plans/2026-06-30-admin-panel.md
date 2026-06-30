# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin panel for verifying psychologist profiles (Phase 8 of PsicoAyuda VE).

**Architecture:** Server Component page queries pending psychologists via `createAdminSupabase()`. Client components handle verification/rejection actions with shadcn Dialog + sonner toast. All mutations go through server actions. Existing middleware protects `/admin` route.

**Tech Stack:** Next.js 16 App Router, Supabase (admin client), Zod, shadcn/ui (`Dialog`), sonner (`toast`), Vitest.

---

## File Structure

### New files:
- `src/features/admin/types.ts` — `PendingPsychologist` interface
- `src/features/admin/actions.ts` — `verifyPsychologist`, `rejectPsychologist`, `getPendingPsychologists`
- `src/features/admin/actions.test.ts` — tests for actions
- `src/features/admin/components/pending-verification.tsx` — table + modal trigger
- `src/features/admin/components/pending-verification.test.tsx` — component tests
- `src/features/admin/components/verification-detail.tsx` — shadcn Dialog modal
- `src/features/admin/components/verification-detail.test.tsx` — component tests
- `src/app/admin/page.tsx` — admin page server component

### Existing (no changes):
- `src/app/admin/layout.tsx` — sidebar layout
- `src/middleware.ts` — route protection

---

### Task 8.1: Types

**Files:**
- Create: `src/features/admin/types.ts`

- [ ] **Step 1: Write types**

```typescript
export interface PendingPsychologist {
  id: string
  displayName: string
  fullName: string
  licenseNumber: string
  licenseDocument: string | null
  avatarUrl: string | null
  createdAt: string
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/types.ts
git commit -m "feat(admin): add PendingPsychologist type"
```

---

### Task 8.2: Admin Actions

**Files:**
- Create: `src/features/admin/actions.ts`
- Create: `src/features/admin/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabase: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn() } },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnThis()
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockSingle.mockReturnThis()
    mockOrder.mockReturnThis()
    mockUpdate.mockReturnThis()
  })

  it('verifyPsychologist returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('some-id')
    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })

  it('verifyPsychologist returns error when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelect.mockResolvedValue({ data: null })
    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('some-id')
    expect(result).toEqual({ error: 'No autorizado' })
  })

  it('verifyPsychologist succeeds for admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelect
      .mockResolvedValueOnce({ data: { id: 'admin-1' } })
      .mockResolvedValueOnce({ error: null })
    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('psy-id')
    expect(result).toEqual({})
  })

  it('rejectPsychologist returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { rejectPsychologist } = await import('./actions')
    const result = await rejectPsychologist('some-id')
    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/features/admin/actions.test.ts --no-threads
```

Expected: FAIL (actions.ts does not exist yet)

- [ ] **Step 3: Write admin actions**

```typescript
'use server'

import { createAdminSupabase } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import type { PendingPsychologist } from '@/features/admin/types'

export async function verifyPsychologist(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: true })
    .eq('id', profileId)

  if (error) {
    logger.error('verify_psychologist failed', error, { profileId })
    return { error: 'Error al verificar psicólogo' }
  }

  revalidatePath('/admin')
  revalidatePath('/psicologos')
  return {}
}

export async function rejectPsychologist(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: false })
    .eq('id', profileId)

  if (error) {
    logger.error('reject_psychologist failed', error, { profileId })
    return { error: 'Error al rechazar psicólogo' }
  }

  revalidatePath('/admin')
  return {}
}

export async function getPendingPsychologists(): Promise<PendingPsychologist[]> {
  const adminSupabase = createAdminSupabase()

  const { data } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      created_at,
      psychologist_profiles!inner (
        full_name,
        license_number,
        license_document
      )
    `)
    .eq('role', 'psychologist')
    .eq('psychologist_profiles.license_verified', false)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    ...(row.psychologist_profiles as unknown as { full_name: string; license_number: string; license_document: string | null }),
  }))
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/features/admin/actions.test.ts --no-threads
```

Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/actions.ts src/features/admin/actions.test.ts
git commit -m "feat(admin): add admin actions with tests"
```

---

### Task 8.3: VerificationDetail Component

**Files:**
- Create: `src/features/admin/components/verification-detail.tsx`
- Create: `src/features/admin/components/verification-detail.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VerificationDetail } from './verification-detail'

const mockPsychologist = {
  id: 'psy-1',
  displayName: 'maria_psicologa',
  fullName: 'María García',
  licenseNumber: '12345',
  licenseDocument: null,
  avatarUrl: null,
  createdAt: '2026-01-15T10:00:00Z',
}

describe('VerificationDetail', () => {
  it('renders psychologist info', () => {
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        onReject={vi.fn()}
      />
    )
    expect(screen.getByText('María García')).toBeDefined()
    expect(screen.getByText('maria_psicologa')).toBeDefined()
    expect(screen.getByText('12345')).toBeDefined()
  })

  it('calls onVerify when Verificar is clicked', () => {
    const onVerify = vi.fn()
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={onVerify}
        onReject={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Verificar'))
    expect(onVerify).toHaveBeenCalledWith('psy-1')
  })

  it('calls onReject when Rechazar is clicked', () => {
    const onReject = vi.fn()
    render(
      <VerificationDetail
        psychologist={mockPsychologist}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        onReject={onReject}
      />
    )
    fireEvent.click(screen.getByText('Rechazar'))
    expect(onReject).toHaveBeenCalledWith('psy-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/features/admin/components/verification-detail.test.tsx --no-threads
```

Expected: FAIL (component does not exist yet)

- [ ] **Step 3: Write VerificationDetail component**

```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PendingPsychologist } from '@/features/admin/types'

interface VerificationDetailProps {
  psychologist: PendingPsychologist
  onClose: () => void
  onVerify: (id: string) => void
  onReject: (id: string) => void
}

export function VerificationDetail({ psychologist, onClose, onVerify, onReject }: VerificationDetailProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{psychologist.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted">Nombre de usuario:</span>
            <p>{psychologist.displayName}</p>
          </div>
          <div>
            <span className="text-muted">Número de colegiatura:</span>
            <p>{psychologist.licenseNumber}</p>
          </div>
          {psychologist.licenseDocument && (
            <div>
              <span className="text-muted">Documento:</span>
              <a
                href={psychologist.licenseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline mt-1"
              >
                Abrir documento
              </a>
            </div>
          )}
          <div>
            <span className="text-muted">Registrado el:</span>
            <p>{new Date(psychologist.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onVerify(psychologist.id); onClose() }}
            className="flex-1 bg-available text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Verificar
          </button>
          <button
            onClick={() => { onReject(psychologist.id); onClose() }}
            className="flex-1 bg-danger text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Rechazar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/features/admin/components/verification-detail.test.tsx --no-threads
```

Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/verification-detail.tsx src/features/admin/components/verification-detail.test.tsx
git commit -m "feat(admin): add VerificationDetail shadcn Dialog component"
```

---

### Task 8.4: PendingVerification Component

**Files:**
- Create: `src/features/admin/components/pending-verification.tsx`
- Create: `src/features/admin/components/pending-verification.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PendingVerification } from './pending-verification'
import type { PendingPsychologist } from '@/features/admin/types'

vi.mock('@/features/admin/actions', () => ({
  verifyPsychologist: vi.fn(),
  rejectPsychologist: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockPsychologists: PendingPsychologist[] = [
  {
    id: 'psy-1',
    displayName: 'maria_psicologa',
    fullName: 'María García',
    licenseNumber: '12345',
    licenseDocument: null,
    avatarUrl: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
]

describe('PendingVerification', () => {
  it('renders empty state', () => {
    render(<PendingVerification psychologists={[]} />)
    expect(screen.getByText('No hay psicólogos pendientes de verificación')).toBeDefined()
  })

  it('renders psychologist rows', () => {
    render(<PendingVerification psychologists={mockPsychologists} />)
    expect(screen.getByText('María García')).toBeDefined()
    expect(screen.getByText('12345')).toBeDefined()
    expect(screen.getByText('Verificar')).toBeDefined()
    expect(screen.getByText('Rechazar')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/features/admin/components/pending-verification.test.tsx --no-threads
```

Expected: FAIL (component does not exist yet)

- [ ] **Step 3: Write PendingVerification component**

```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { verifyPsychologist, rejectPsychologist } from '@/features/admin/actions'
import { VerificationDetail } from './verification-detail'
import type { PendingPsychologist } from '@/features/admin/types'

interface PendingVerificationProps {
  psychologists: PendingPsychologist[]
}

export function PendingVerification({ psychologists }: PendingVerificationProps) {
  const [selected, setSelected] = useState<PendingPsychologist | null>(null)

  async function handleVerify(id: string) {
    const result = await verifyPsychologist(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Psicólogo verificado correctamente')
    }
  }

  async function handleReject(id: string) {
    const result = await rejectPsychologist(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Psicólogo rechazado')
    }
  }

  if (psychologists.length === 0) {
    return (
      <p className="text-muted text-center py-8">No hay psicólogos pendientes de verificación</p>
    )
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted">
            <th className="pb-3 font-medium">Psicólogo</th>
            <th className="pb-3 font-medium">Colegiatura</th>
            <th className="pb-3 font-medium">Documento</th>
            <th className="pb-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {psychologists.map((psy) => (
            <tr key={psy.id} className="border-b border-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background-alt flex items-center justify-center text-sm font-medium text-muted">
                    {psy.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{psy.fullName}</p>
                    <p className="text-sm text-muted">{psy.displayName}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-sm">{psy.licenseNumber}</td>
              <td className="py-3">
                {psy.licenseDocument ? (
                  <button
                    onClick={() => setSelected(psy)}
                    className="text-primary text-sm hover:underline"
                  >
                    Ver documento
                  </button>
                ) : (
                  <span className="text-sm text-muted">Sin documento</span>
                )}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(psy.id)}
                    className="text-sm bg-available text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => handleReject(psy.id)}
                    className="text-sm bg-danger text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                  >
                    Rechazar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <VerificationDetail
          psychologist={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/features/admin/components/pending-verification.test.tsx --no-threads
```

Expected: PASS (2/2)

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/pending-verification.tsx src/features/admin/components/pending-verification.test.tsx
git commit -m "feat(admin): add PendingVerification table with sonner toast"
```

---

### Task 8.5: Admin Page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write admin page**

```typescript
import type { Metadata } from 'next'
import { getPendingPsychologists } from '@/features/admin/actions'
import { PendingVerification } from '@/features/admin/components/pending-verification'

export const metadata: Metadata = {
  title: 'Verificaciones pendientes',
}

export default async function AdminPage() {
  const pending = await getPendingPsychologists()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Verificaciones pendientes</h1>
      <PendingVerification psychologists={pending} />
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): add admin page with pending verifications"
```

---

### Task 8.6: DoD

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: ALL PASS

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors (no `ignoreBuildErrors: true`)
