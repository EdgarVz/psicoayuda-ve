# UI Alignment + Tech Debt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all lint errors, resolve doc/code discrepancies, and align 7 UI pages with approved mockups.

**Architecture:** 5 sequential phases ordered by dependency — foundation fixes first, then visual changes per component, then schema migration, then remaining pages. Each phase is independently buildable and testable.

**Tech Stack:** Next.js 16, TypeScript 5, Tailwind CSS 4, Supabase (native client), Zod 4, Vitest

---

### Task 1.1 — Fix `require()` in resend.ts

**Files:**
- Modify: `src/lib/resend.ts:9`

- [ ] **Step 1: Change `require()` to dynamic `import()`**

```typescript
// Before (line 9):
const { Resend } = require('resend')
return new Resend(env.RESEND_API_KEY)

// After:
const { Resend } = await import('resend')
return new Resend(env.RESEND_API_KEY)
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: No more `no-require-imports` error on resend.ts

---

### Task 1.2 — Ignore database.ts in ESLint

**Files:**
- Modify: `eslint.config.*` (find the correct ESLint config file first)

- [ ] **Step 1: Find ESLint config**

Run: `Get-ChildItem -LiteralPath "." -Filter "eslint*"` to find config file name

- [ ] **Step 2: Add ignore pattern for `src/types/database.ts`**

Add `'src/types/database.ts'` to the `ignores` array in the ESLint config.

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: No more "File appears to be binary" error

---

### Task 1.3 — Fix unused variables

**Files:**
- Modify: `src/app/error.tsx:3`
- Modify: `src/app/layout.tsx:14`
- Modify: `src/features/catalog/types.ts:3-4`

- [ ] **Step 1: Rename `error` to `_error` in error.tsx**

```typescript
// Before:
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {

// After:
export default function Error({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
```

- [ ] **Step 2: Use `nonce` in layout.tsx**

Either remove the variable if it's truly unused, or pass it to the HTML element:
```typescript
// If using nonce:
<html lang="es" className={geist.variable} nonce={nonce}>
```
Or simply remove the `const nonce = ...` line.

- [ ] **Step 3: Remove unused type exports from catalog/types.ts**

Remove `ProfileRow` and `PsychologistRow` exports — they're unused. Keep only what's actually imported elsewhere.

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: No warnings for unused vars

---

### Task 1.4 — Create vitest.config.ts

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest config**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Verify tests still pass**

Run: `npm test`
Expected: 12/12 PASS

---

### Task 1.5 — Update docs (plan checkboxes + DESIGN.md)

**Files:**
- Modify: `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md`
- Modify: `DESIGN.md`

- [ ] **Step 1: Mark Phases 5-6 as completed in implementation plan**

Find all `[ ]` in the Phase 5 and Phase 6 sections (tasks 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5) and change to `[x]`.

- [ ] **Step 2: Update DESIGN.md card layout**

Change the Psychologist Card section from horizontal layout description to vertical layout:
- Avatar: 56px circle centered, emoji fallback
- Info below avatar
- "Conectar con [fullName]" button

---

### Task 2.0 — Move landing page into (public) route group

**Files:**
- Move: `src/app/page.tsx` → `src/app/(public)/page.tsx`

- [ ] **Step 1: Move file**

Move `src/app/page.tsx` into `src/app/(public)/page.tsx`. The `(public)` route group does not affect URL — `/` continues to work. The landing page now inherits Navbar + Footer from `(public)/layout.tsx`.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: PASS

### Task 2.1 — Hero gradient alignment

**Files:**
- Modify: `src/app/(public)/page.tsx` (was at root, now under (public))

- [ ] **Step 1: Update hero gradient**

Find the hero section gradient classes. Change to match mockup:
```tsx
// Replace current gradient with:
<div className="bg-gradient-to-br from-[#E8F4F0] via-[#FDF8F3] to-[#FDF8F3]">
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 2.2 — PsychologistCard vertical layout + emoji avatar

**Files:**
- Modify: `src/features/catalog/components/psychologist-card.tsx`

- [ ] **Step 1: Refactor card to vertical layout**

Keys changes:
- Layout: `flex flex-col items-center text-center` instead of `flex items-center gap-4`
- Avatar: 56px (w-14 h-14) instead of 96px
- Fallback: emoji `👩‍⚕️` or `👨‍⚕️` instead of initial char
- Button text: `Conectar con ${fullName}` instead of `Conectar`

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 2.3 — SpecialtyFilter add "Todas" chip

**Files:**
- Modify: `src/features/catalog/components/specialty-filter.tsx`

- [ ] **Step 1: Read current filter implementation**

Use grep/read to understand current filter state management.

- [ ] **Step 2: Add "Todas" chip**

Add a first chip "Todas" that resets the filter (sets selected to null/empty).

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 3.1 — Migration: add years_experience column

**Files:**
- Migration via Supabase MCP

- [ ] **Step 1: Apply migration**

```sql
ALTER TABLE psychologist_profiles
  ADD COLUMN years_experience INT;
```

- [ ] **Step 2: Regenerate types**

Run: `npx supabase gen types typescript --project-id iptavlxqdzmxlpsopofw > src/types/database.ts`

- [ ] **Step 3: Update ESLint ignore (database.ts was regenerated)**

Verify `src/types/database.ts` is still in ESLint ignore.

---

### Task 3.2 — PsychologistProfile single column + years experience

**Files:**
- Modify: `src/features/psychologist/components/psychologist-profile.tsx`
- Modify: `src/features/psychologist/queries.ts`

- [ ] **Step 1: Add `yearsExperience` to query return type**

Add `yearsExperience` field to `PsychologistDetail` interface and map from `psychologist_profiles.years_experience`.

- [ ] **Step 2: Refactor profile layout to single column**

Change from `flex flex-col md:flex-row` (two columns) to single column:
- Avatar + name + badge centered
- Bio below
- "¿Cómo funciona?" as card with 4 steps
- CTA button at bottom

- [ ] **Step 3: Enhance "¿Cómo funciona?" card**

Replace notice box with 4-step numbered card:
```
🌱 ¿Cómo funciona?
1. Solicitas contacto con el psicólogo
2. El psicólogo recibe tu solicitud y la acepta
3. Recibirás un enlace directo a WhatsApp
4. Hablan directamente — la plataforma no almacena conversaciones
```

- [ ] **Step 4: Add pulse animation to CTA**

Add `animate-pulse` class with slow duration to the CTA button:
```tsx
className="... animate-pulse"
style={{ animationDuration: '3.5s' }}
```

- [ ] **Step 5: Show years of experience**

If `psychologist.yearsExperience` > 0:
```tsx
<p className="text-sm text-muted">{psychologist.yearsExperience} años de experiencia</p>
```

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 3.3 — Design doc version of psych detail spec

**Files:**
- Modify: `docs/superpowers/specs/2026-06-29-phases-5-6-psychologist-detail-and-appointments.md`

- [ ] **Step 1: Update spec to reflect actual implementation**

The spec currently shows `[ ]` for most steps. Mark them as completed.

---

### Task 4.1 — Login page decorative icon

**Files:**
- Modify: `src/app/(public)/login/page.tsx`

- [ ] **Step 1: Add 🔑 icon circle**

Before the title, add:
```tsx
<div className="w-[72px] h-[72px] bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
  <span className="text-3xl">🔑</span>
</div>
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 4.2 — RequestForm pill-style checkboxes + consent

**Files:**
- Modify: `src/features/appointments/components/request-form.tsx`

- [ ] **Step 1: Change checkboxes to pill toggles**

Replace the grid of checkboxes with a flex-wrap layout of pill-style buttons:
```tsx
{REASONS.map(({ value, label }) => (
  <button
    key={value}
    type="button"
    onClick={() => toggleReason(value)}
    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
      selectedReasons.includes(value)
        ? 'bg-primary/10 border-primary text-primary'
        : 'bg-white border-border hover:border-primary/50 text-muted'
    }`}
  >
    {label}
  </button>
))}
```

- [ ] **Step 2: Update consent text**

Replace the consent text with:
```
"Entiendo que esta plataforma es solo un medio de contacto y la atención ocurre fuera de ella, a través de WhatsApp."
```

- [ ] **Step 3: Style consent box**

Wrap the consent checkbox in a card-style container:
```tsx
<div className="bg-[#FAF6F1] rounded-radius-card p-6">
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 4.3 — RequestStatus pending + accepted enhancements

**Files:**
- Modify: `src/features/appointments/components/request-status.tsx`

- [ ] **Step 1: Read current component**

Read the full current implementation to understand the rendering.

- [ ] **Step 2: Enhance pending state**

Change from simple clock icon + message to a richer card with:
- 🌱 large icon
- Info card showing: psychologist name, status badge, request ID formatted as `#${id.slice(0,7).toUpperCase()}`
- "Tu solicitud ha sido enviada a [psychologistName]."

- [ ] **Step 3: Enhance accepted state — add message preview**

Add a green info box showing the WhatsApp message preview:
```tsx
<div className="bg-green-50 border border-green-200 rounded-radius-card p-4 text-sm text-left mb-4">
  <p className="font-medium text-green-800 mb-1">Mensaje predeterminado:</p>
  <p className="text-green-700">"Hola, vengo de PsicoAyuda VE. Solicito apoyo psicológico."</p>
</div>
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: PASS

---

### Task 5.1 — Final DoD verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS (no `ignoreBuildErrors: true`)

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: 12/12 PASS (minimum)

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Fase 1 (foundation fixes) → Tasks 1.1-1.5
- ✅ Fase 2 (landing + catálogo) → Tasks 2.1-2.3
- ✅ Fase 3 (schema + perfil) → Tasks 3.1-3.3
- ✅ Fase 4 (login + forms + status) → Tasks 4.1-4.3
- ✅ Fase 5 (DoD) → Task 5.1

**2. Placeholder scan:** No "TBD", "TODO", or incomplete code blocks. All steps have explicit code or exact commands.

**3. Type consistency:** No new types introduced. Existing interfaces (`PsychologistDetail`) extended with `yearsExperience`. No cross-task type mismatches.
