# Tech Debt + Doc Alignment Sprint

> **For agentic workers:** Use superpowers:dispatching-parallel-agents (Wave 1) + TDD per block.

**Goal:** Resolve all 9 identified discrepancies and tech debt items across the PsicoAyuda VE codebase.

**Branch strategy:** Each block in its own Paseo worktree (`fix/tech-debt-<slug>`), squash merge to `develop`.

**Order:** Risk-descending. Wave 1 runs in parallel via subagents.

---

## Wave 1 (parallel — 4 subagents)

### Block B — Bug navbar `isLoggedIn` [🔴 Alto]

**Files:**
- Modify: `src/app/(public)/layout.tsx` — pasar `isLoggedIn` al Navbar
- Modify: `src/features/layout/components/navbar.tsx` — consumir prop correctamente

**Approach:**
PublicLayout debe leer `x-user-authenticated` del header y pasarlo como prop `<Navbar isLoggedIn={isLoggedIn} />`, igual que hace `(auth)/layout.tsx`.

**TDD:**
1. Escribir test: navbar renderiza "Dashboard" cuando `isLoggedIn=true`, renderiza "Ingresar" cuando `isLoggedIn=false`
2. Implementar fix
3. Verificar: lint + tsc + test pass

---

### Block E — Resend notifications [🟡 Medio]

**Files:**
- Modify: `src/features/appointments/actions.ts` — importar Resend y enviar email tras submit/accept/reject
- Modify: `src/lib/resend.ts` — verificar que `getResendClient()` funciona (ya existe)

**Approach:**
Tras `submitRequest` exitoso, enviar email al psicólogo (si tiene email). Tras `acceptRequest`, enviar email al paciente. Usar `getResendClient()` con fallback silencioso (`logger.warn` si falla).

**TDD:**
1. Escribir test: mock `resend.emails.send()`, verificar que se llama tras submit
2. Escribir test: mock fallo de Resend, verificar que no rompe el flujo (fallback)
3. Implementar
4. Build + test pass

---

### Block G — Migrar middleware → proxy [🟡 Medio]

**Files:**
- Create: `src/proxy.ts` — nuevo archivo proxy (Next.js 16)
- Delete/Modify: `src/middleware.ts` — migrar lógica existente

**Approach:**
Next.js 16 deprecó `middleware.ts` en favor de `src/proxy.ts`. Migrar manteniendo: CSP nonce, cookie `auth_logged_in`, header `x-user-authenticated`, protección `/admin` con `getUser()`.

**TDD:**
1. Escribir test: proxy setea CSP header en toda request
2. Escribir test: proxy setea `x-user-authenticated` desde cookie
3. Escribir test: proxy redirige a `/login` si no autenticado en `/dashboard`
4. Implementar proxy.ts
5. Build + test pass

---

### Block H — Playwright setup + E2E smoke test [🟡 Medio]

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts` — test de navegación básica
- Modify: `package.json` — añadir script `"test:e2e"`

**Approach:**
Configurar Playwright con proyecto base. Smoke test: navegar a home, verificar hero title, navegar a /psicologos, verificar grid.

**TDD:**
1. Escribir playwright.config.ts
2. Escribir smoke spec
3. Verificar: `npx playwright test` pasa

---

## Wave 2 (sequential — low risk)

### Block A — CSS tokens alignment [🟢 Bajo]

**Files:**
- Modify: `src/app/globals.css` — corregir valores `muted`, `muted-foreground`; agregar tokens faltantes (`secondary`, `secondary-foreground`, `card`, `popover`, `ring`, `input`)
- Modify: `DESIGN.md` — verificar tokens documentados

**Approach:**
Reemplazar `--color-muted: #8B7E72` → `#F5F0EA` (fondo). Reemplazar `--color-muted-light` (no documentado) por `--color-muted-foreground: #B0A89C`. Agregar tokens faltantes.

**Validation:** Build check visual + lint + tsc.

---

### Block C — Type safety (`as unknown as`) [🟢 Bajo]

**Files:**
- Modify: `src/features/psychologist/queries.ts` — nested join cast
- Modify: `src/features/appointments/actions.ts` — nested join cast (if any)
- Modify: `src/app/(auth)/solicitar/[id]/page.tsx` — nested join cast

**Approach:**
Crear interfaces locales tipadas para los joins anidados en lugar de `as unknown as`. Revisar si ya existen en `database.ts`.

**Validation:** tsc pass without `as unknown as` in modified files.

---

### Block F — Accesibilidad input [🟢 Bajo]

**Files:**
- Modify: `src/features/appointments/components/request-form.tsx` — checkbox consentimiento

**Approach:**
El checkbox de consentimiento usa `className="sr-only"` para el input visual, pero no tiene un `<label>` con `htmlFor` vinculado. Asociar el label explícitamente.

**Validation:** lint + tsc + building.

---

### Block D — Documentación obsoleta [🟢 Bajo]

**Files:**
- Modify: `ARCHITECTURE.md` — eliminar `autoestima` del enum, marcar Phase 8 y 9 como implementados (ya tienen nota)
- Modify: `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md` — actualizar checkboxes a `[x]` para Phases 5-9, eliminar `dashboard/actions.ts` de estructura
- Modify: `docs/superpowers/plans/2026-06-30-admin-panel.md` — actualizar checkboxes a `[x]`

**Validation:** Revisión manual.

---

### Block I — Migration formal `years_experience` [🟢 Bajo]

**Files:**
- Create: `supabase/migrations/<timestamp>_add_years_experience.sql`

**Approach:**
La migration `ALTER TABLE psychologist_profiles ADD COLUMN years_experience INT;` se aplicó manualmente en Supabase Dashboard. Crear el archivo de migration formal para que el historial esté completo.

**Validation:** `supabase db dump` verifica que la columna existe.

---

## Dependencies

```
Wave 1 (B, E, G, H) → fully parallel, no shared files
Wave 2 (A, C, F) → fully parallel, no shared files
Wave 3 (D, I) → fully parallel, no shared files
```

**No blocking dependencies between waves.** Each block is independent.

## Acceptance

- Build: `npm run build` PASS
- Lint: `npm run lint` PASS
- Typecheck: `npx tsc --noEmit` PASS
- Tests: `npm test` PASS (existing 83 tests + new TDD tests)
- E2E: `npx playwright test` PASS (Block H)
- Git: clean working tree, commits por bloque
