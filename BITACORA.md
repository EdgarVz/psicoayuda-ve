# BITACORA — PsicoAyuda VE

## 2026-06-28 — Inicio del proyecto

### Contexto
Plataforma de apoyo psicológico en crisis para Venezuela. Conexión paciente-psicólogo vía WhatsApp.

### Setup inicial
- Stack: Next.js 15 + Supabase + Tailwind 4 + shadcn/ui
- Documentación limpiada y adaptada de proyecto previo (BienesRaíces VE)
- Pendiente: inicialización del proyecto Next.js y configuración de Supabase

## 2026-06-28 — Rediseño visual: paleta cálida

### Cambios
- Paleta fría (azul oxford `#0C4A6E` + turquesa) → paleta cálida (verde salvia `#2B7A6E` + beige tierra `#F7F1EA`/`#FDF8F3`)
- Border-radius aumentado: 12-14px botones, 16px cards
- Tono verbal humanizado: "Conectar", "Conversar", "Espacio para hablar"
- Fondos beige en reemplazo de grises fríos
- WhatsApp `#25d366` como único color saturado
- Mockups generados en `mockups.html` con 10 pantallas desktop + mobile

### Archivos modificados
- `DESIGN.md` — reescrito con nueva paleta y tono verbal
- `docs/superpowers/specs/2026-06-28-psicoayuda-design.md` — design tokens actualizados
- `mockups.html` — mockups visuales con la nueva paleta

## 2026-06-29 — Setup del proyecto + resolución de conflictos

### Supabase
- Nuevo proyecto creado: `iptavlxqdzmxlpsopofw` (región São Paulo)
- `opencode.json` actualizado con el nuevo project ref
- MCP Supabase ahora apunta al proyecto correcto

### Next.js
- Scaffold con `create-next-app@16.2.9`: App Router, TypeScript, Tailwind 4
- Dependencias instaladas: `@supabase/supabase-js`, `@supabase/ssr`, `zustand`, `zod`, `resend`, `@sentry/nextjs`, `lucide-react`
- shadcn/ui components: `button`, `card`, `input`, `label`, `checkbox`, `select`, `sonner`
- `vitest` instalado para tests
- Build compila sin errores

### Credenciales
- `.env.local` con Supabase keys, Resend (`re_YN2T1ZKb_LqQJznvyTMirW2qBVabHbbne`), Sentry DSN
- `.env.example` creado (service_role vacío por seguridad)

### Docs actualizados
- `AGENTS.md` — project ref corregido
- `README.md` — Next.js 16, setup detallado
- `SECURITY.md` — "Magic Links" en vez de "email"
- `SMOKE-TEST.md` — flujo Magic Link
- `SOUL.md`, `USER.md` — Next.js 16
- `ARCHITECTURE.md` — columnas `license_document`, sin `patient_name`, CHECK constraint

## 2026-06-29 — Phase 1 completada: Foundation

### Git + GitHub
- Repositorio creado: `EdgarVz/psicoayuda-ve` (público)
- Ramas: `main` (producción), `develop` (integración)
- Primer commit: `2958d47` — scaffold inicial

### Phase 1 implementada
- `src/lib/env.ts` — validación Zod de env vars
- `src/lib/supabase/client.ts` + `server.ts` + `admin.ts` — 3 clientes Supabase
- `src/lib/logger.ts` — Logger con Sentry condicional
- `src/lib/resend.ts` — Cliente Resend con fallback
- `src/lib/rate-limit.ts` — Rate limiter in-memory 10 req/10s
- `src/middleware.ts` — CSP nonce, cookie auth, proteger `/dashboard` + `/admin`
- `src/app/globals.css` — tokens de diseño (paleta cálida)
- `src/app/layout.tsx` + `error.tsx` + `not-found.tsx` — layouts base
- `src/app/(public)/layout.tsx` — Navbar + Footer
- `src/app/(auth)/layout.tsx` — Auth check wrapper
- `src/app/admin/layout.tsx` — Sidebar admin (#3D3834)
- `src/features/layout/components/navbar.tsx` + `footer.tsx`
- `src/app/page.tsx` — Landing page placeholder
- Build verificado: `npm run build` exitoso

### Notas
- ⚠️ Next.js 16 deprecó `middleware` en favor de `proxy` — migrar en futura iteración

## 2026-06-29 — Phase 2 completada (Database + RLS) + Vercel deploy

### Migrations ejecutadas vía Supabase Management API
- **Task 2.1:** Enums (`user_role`, `request_status`, `specialty`) + 4 tablas (`profiles`, `psychologist_profiles`, `appointment_requests`, `admin_roles`)
- **Task 2.2:** 11 RLS policies (lectura pública, escritura propia, WhatsApp en accepted, admin, etc.)
- **Task 2.3:** Trigger `update_timestamp()` en 3 tablas
- **Task 2.4:** Trigger `on_auth_user_created` para auto-crear profile al registrarse
- Tipos de DB regenerados

### Vercel
- Proyecto vinculado: `EdgarVz/psicoayuda-ve`
- `main` → producción
- `develop` → preview
- ⬜ Pendiente: definir `NEXT_PUBLIC_SITE_URL` con URL de preview

### Fixes post-deploy
- Middleware fallaba con `MIDDLEWARE_INVOCATION_FAILED` (500) — `@supabase/ssr` incompatible con Edge Runtime
- Fix: import dinámico de `createServerSupabase` dentro del bloque `/admin`
- Geist font ruta incorrecta (variable .woff2 no resuelta por Turbopack)
- Fix: usar `import { GeistSans } from 'geist/font/sans'` en vez de `localFont` manual
- `@t3-oss/env-nextjs` no estaba instalado (missing dep de Phase 1)
- `feat-database-rls` nunca se mergeó a `develop` — corregido

## 2026-06-29 — Phase 3 completada: Auth (Magic Links)

### Cambios
- **Task 3.1:** `src/features/auth/schemas.ts` — Zod schemas (`magicLinkSchema`, `psychologistSignupSchema`) + tests (5/5)
- **Task 3.2:** `src/features/auth/actions.ts` — Server Actions (`sendMagicLink`, `signOut`)
- **Task 3.3:** `src/features/auth/components/magic-link-form.tsx` — Form con 4 estados (idle/sending/sent/error) + `src/app/(public)/login/page.tsx`
- Implementado por subagente Paseo en worktree `feat-auth-phase-3`

### Revisión de proyecto referente
- Analizado `build4venezuela/acompa-amientopsicologico` (Angular 21, contraseñas, sesiones invitadas)
- Conclusión: proyectos independientes, enfoques distintos, pueden coexistir

## 2026-06-29 — Phase 4 completada: Catalog

### Cambios
- **Task 4.1:** `src/features/catalog/types.ts` + `queries.ts` — tipos y consultas Supabase
- **Task 4.2:** `psychologist-card.tsx` (con skeleton), `psychologist-list.tsx` (grid + empty state), `specialty-filter.tsx` (toggle 10 especialidades)
- **Task 4.3:** `src/app/page.tsx` — Hero + lista de disponibles
- **Task 4.4:** `/psicologos` — catálogo completo con filtros via searchParams + CatalogClient
- Build verificado: `npm run build` exitoso

## 2026-06-29 — Phase 5 completada: Psychologist Detail

### Cambios
- **Task 5.1:** `src/features/psychologist/queries.ts` — `getPsychologistById` con join profiles + psychologist_profiles
- **Task 5.2:** `src/features/psychologist/components/psychologist-profile.tsx` — avatar, specialties tags, disponibilidad, badge verificado, "¿Cómo funciona?" card, CTA WhatsApp
- **Task 5.3:** `src/app/(public)/psicologo/[id]/page.tsx` — Server Component con metadata dinámica, UUID param
- Implementado por subagente Paseo en paralelo con Phase 6
- tsc PASS, build PASS

## 2026-06-29 — Phase 6 completada: Appointments

### Cambios
- **Task 6.1:** `src/features/appointments/schemas.ts` + `types.ts` — Zod schemas con 10 especialidades, 7 tests PASS
- **Task 6.2:** `src/features/appointments/actions.ts` — Server Actions: submitRequest, acceptRequest, rejectRequest
- **Task 6.3:** `src/features/appointments/components/request-form.tsx` — Formulario con edad, motivos checkboxes, horario, consentimiento
- **Task 6.4:** `src/app/(auth)/solicitar/[id]/page.tsx` — Página de solicitud con verificación de disponibilidad + licencia
- **Task 6.5:** `request-status.tsx` (pending/accepted/rejected) + `src/app/(auth)/solicitud/[id]/page.tsx`
- Implementado por subagente Paseo en paralelo con Phase 5
- tsc PASS, tests 7/7 PASS, build PASS

## 2026-06-29 — UI alignment con mockups + seed data

### Cambios
- `src/app/page.tsx` — Hero rediseñado para alinear con mockups
- `src/features/layout/components/navbar.tsx` — Navbar adaptado a diseño aprobado
- `src/features/psychologist/components/psychologist-profile.tsx` — Detalle pulido
- `src/features/appointments/components/request-form.tsx` — Formulario ajustado
- `src/app/globals.css` — Tokens visuales refinados
- Seed de psicólogos de prueba insertado en la base de datos

### Archivos modificados
- 5 archivos, +112/-38 líneas

## 2026-06-29 — Sprint UI alignment + tech debt (feat-ui-alignment-tech-debt)

### Tech debt (Phase 1-2)
- `resend.ts`: `require()` → `import()` dinámico
- `database.ts` añadido a ESLint ignore
- `eslint.config.mjs`: `varsIgnorePattern "^_"` + limpieza de variables no usadas
- `vitest.config.ts` creado para test runner
- `DESIGN.md`: card layout horizontal → vertical (alineado con mockups)

### UI alignment (Phase 4)
- Landing page movida a `(public)/` route group
- Hero con gradiente + cards verticales con emoji + chip "Todas" en filtro
- Root `page.tsx` eliminado (ruta duplicada)
- Login: icono decorativo 🔑
- RequestForm: pill toggles, caja de consentimiento estilizada
- RequestStatus: ID formateado + preview mensaje WhatsApp

### Psychologist profile (Phase 3 — uncommitted hasta ahora)
- `queries.ts`: `PsychologistDetail` con `yearsExperience`
- `psychologist-profile.tsx`: layout columna única centrada, 4 pasos numerados, pulse animation CTA, badge años experiencia
- `database.ts`: regenerado con `years_experience` en `psychologist_profiles`

### Migration SQL ejecutada manualmente en Supabase Dashboard
- `ALTER TABLE psychologist_profiles ADD COLUMN years_experience INT;`

### Fixes finales
- `request-status.tsx`: `requestId` faltante en destructuring

### Checks
- lint PASS, tsc PASS, build PASS, tests 12/12 PASS

## 2026-06-29 — Fix catálogo vacío + docs SMTP

### Problema
El catálogo de psicólogos no mostraba resultados pese a haber datos en DB. Causa: `.order('psychologist_profiles.is_available')` con notación de punto — el cliente JS de Supabase v2 requiere `{ foreignTable }` para ordenar por columnas de tablas anidadas.

### Fix
- `src/features/catalog/queries.ts`: `.order('is_available', { foreignTable: 'psychologist_profiles', ascending: false })`
- Agregado `logger.error()` para visibilidad de errores Supabase

### Documentación
- `ARCHITECTURE.md`: sección Auth (Magic Links) con guía de configuración SMTP
- `ARCHITECTURE.md`: columna `years_experience` agregada a tabla `psychologist_profiles`

### Checks
- lint PASS, tsc PASS, build PASS, tests 12/12 PASS
- Commit: `f22d3a4`

## 2026-06-29 — SPECIALTY_LABELS compartido + fix encoding

### Cambios
- `src/lib/specialties.ts` creado con mapping `SPECIALTY_LABELS` compartido
- `psychologist-card.tsx`: usa `SPECIALTY_LABELS[s]` en vez de mostrar `crisis_panico` crudo
- `psychologist-profile.tsx`: importa desde `@/lib/specialties` en vez de constante local

### Checks
- lint PASS, tsc PASS
- Commit: `aec2e94`

## 2026-06-29 — Fix etiquetas especialidades

### Cambios
- `src/lib/specialties.ts`: `apoyo_ninos` → "Apoyo a niños", `apoyo_adolescentes` → "Apoyo a adolescentes"

### Checks
- lint PASS, tsc PASS
- Commit: `2b99fc7`

## 2026-06-29 — Tech debt N1+N2 + doc alignment

### Cambios
- `package.json`: movido `shadcn` de `dependencies` a `devDependencies`
- `src/app/layout.tsx`: Toaster import desde `@/components/ui/sonner` (iconos custom Lucide)
- `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md`: estructura actualizada (home en `(public)/`, `catalog-client.tsx`, `specialties.ts`, `utils.ts`); checkboxes Phases 5-6 marcados como `[x]`

### Checks
- lint PASS, tsc PASS, build PASS, tests 12/12 PASS
- Branch: `fix/tech-debt`

## 2026-06-29 — Phase 7: Dashboard (TDD)

### Cambios
- `src/features/dashboard/types.ts` — interfaces `PatientRequestView`, `PsychologistRequestView`, `DashboardStats`
- `src/features/dashboard/queries.ts` — `getPatientRequests`, `getPsychologistRequests`, `getPatientStats`, `getPsychologistStats`
- `src/features/dashboard/components/stats-cards.tsx` — 4 cards con labels en español
- `src/features/dashboard/components/requests-list.tsx` — Client Component con tabs, filtros, acciones Aceptar/Rechazar, WhatsApp link; usa `SPECIALTY_LABELS`
- `src/features/dashboard/components/patient-dashboard.tsx` — "Mis espacios"
- `src/features/dashboard/components/psychologist-dashboard.tsx` — "Solicitudes recibidas"
- `src/app/(auth)/dashboard/page.tsx` — página role-based con `getUser()`
- `vitest.config.ts`: soporte `.test.tsx` + `jsdom` + `@testing-library/react`

### TDD Cycles
1. `queries.test.ts` → 5 tests (mock Supabase)
2. `stats-cards.test.tsx` → 3 tests (render jsdom)
3. `requests-list.test.tsx` → 8 tests (tabs, filtros, acciones, empty state)
4. `patient-dashboard.test.tsx` + `psychologist-dashboard.test.tsx` → 4 tests (composición)
5. Dashboard page — build check

### Checks
- lint PASS, tsc PASS, build PASS, tests 32/32 PASS
- Branch: `feat/dashboard-phase-7`
- Commit: `763d8b4`

## 2026-06-30 — Phase 8: Admin Panel (fix/admin-panel)

### Cambios
- `src/features/admin/types.ts`: interface `PendingPsychologist`
- `src/features/admin/actions.ts`: `verifyPsychologist`, `rejectPsychologist`, `getPendingPsychologists`
- `src/features/admin/components/verification-detail.tsx`: modal con shadcn Dialog
- `src/features/admin/components/pending-verification.tsx`: tabla con toast sonner
- `src/app/admin/page.tsx`: server component con lista de pendientes
- Tests: actions, VerificationDetail, PendingVerification

### Checks
- tests PASS (15 files, 68 tests), lint PASS, tsc PASS, build PASS
- Branch: `fix/admin-panel`

## 2026-06-30 — Tech debt + doc realignment (fix/tech-debt-realign)

### Cambios
- `npm install` — reparados `@testing-library/react` y `jsdom` faltantes en node_modules
- `requests-list.test.tsx` + `psychologist-dashboard.test.tsx`: tipados callbacks (fix TS7006)
- `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md`: actualizado root layout (Geist vía `geist/font/sans`, Toaster vía `sonner`)
- `ARCHITECTURE.md`: nota que `features/admin/` (Phase 8) no está implementado

### Checks
- lint PASS, tsc PASS (0 errores), build PASS
- Branch: `fix/tech-debt-realign`
- Commit: `c68be40`

## 2026-06-30 — Tech debt sprint + Psychologist registration (Phase 9)

### Bloque A-H: Tech debt + doc alignment

| Bloque | Archivo | Cambio |
|--------|---------|--------|
| A | `ARCHITECTURE.md` | font loading (`geist/font/sans`), database.ts path, enum specialty documentado |
| B | `globals.css` | +7 tokens alineados con DESIGN.md; `--color-muted` corregido |
| C | `specialty-filter.tsx` + `request-form.tsx` | especialidades vía `SPECIALTY_LABELS` desde `@/lib/specialties` |
| D | `database.ts` + 5 archivos | nested joins tipados con interfaces con nombre (`Nested*`), reemplazan `as unknown as` inline |
| E | `middleware.ts` | CSP: `*.sentry-cdn.com` en script-src, `*.ingest.sentry.io` en connect-src |
| F1 | `catalog-client.tsx` | movido a `features/catalog/components/` |
| F2 | `request-status.tsx` | eliminado `'use client'` innecesario |
| G | `resend.ts` | `console.warn` → `logger.warn` + mantener console.warn como dev fallback |
| H | `vitest.config.ts` | environment `node` → `jsdom` |

### Bloque I: Registro de psicólogo (ruta `/registro-psicologo`)
- **Task 9.1:** `schemas.ts` — Zod schema + 5 tests PASS
- **Task 9.2:** `actions.ts` — Server Action con admin client insert + 5 tests PASS
- **Task 9.3:** `registration-form.tsx` — Client Form con pill toggles, 4 estados, consent + `page.tsx` protegida + 5 tests PASS
- Flujo: Magic Link → formulario → admin client insert → dashboard
- Build verificado: PASS

### Archivos modificados/nuevos
- 23 archivos modificados, 7 nuevos, +644/-70 líneas
- Nuevos: `src/app/(public)/registro-psicologo/page.tsx`, `src/features/psychologist-registration/` (5 archivos)

### Checks
- lint PASS, tsc 0 errores, tests 83/83 (18 suites), build 9 rutas PASS
- Branch: `fix-tech-debt-registration` (worktree Paseo)
- PR: [#7](https://github.com/EdgarVz/psicoayuda-ve/pull/7) contra `develop`

## 2026-06-30 — Tech debt sprint: plan + doc fixes

### Cambios
- `docs/superpowers/plans/2026-06-30-tech-debt-sprint.md` — plan integral para 9 bloques de deuda técnica
- `ARCHITECTURE.md` — corregido enum `specialty` (eliminado `autoestima` inexistente)
- `docs/superpowers/plans/2026-06-29-psicoayuda-implementation.md` — checkboxes Phases 5-9 marcados `[x]`, estructura dashboard actualizada
- `docs/superpowers/plans/2026-06-30-admin-panel.md` — checkboxes marcados `[x]`

### Pendiente (próximos subagentes)
- Wave 1: Bug navbar (B), Resend (E), middleware→proxy (G), Playwright (H)
- Wave 2: CSS tokens (A), type safety (C), accesibilidad input (F)
- Wave 3: Migration formal years_experience (I)

### Checks
- lint PASS, tsc PASS, build PASS

## 2026-06-30 — Tech debt sprint Wave 2: CSS tokens + type safety + accesibilidad + migration

### Cambios
- **Block A (CSS tokens):** `globals.css` alineado con DESIGN.md — muted bg/text corregido, muted-light eliminado, secondary/card/popover/ring/input añadidos
- **Block C (Type safety):** 5 archivos con `as unknown as` reemplazados por interfaces nombradas (`NestedPsychologistProfile`, `CatalogPsychologistProfile`, `NestedPatientProfile`, etc.)
- **Block F (Accesibilidad):** checkbox de consentimiento con `id` + `htmlFor`; test-setup.ts para matchers jsdom
- **Block I (Migration SQL):** `supabase/migrations/20260630000001_add_years_experience.sql` formalizado

### PRs
- [#12](https://github.com/EdgarVz/psicoayuda-ve/pull/12) — fix: align CSS tokens with DESIGN.md
- [#13](https://github.com/EdgarVz/psicoayuda-ve/pull/13) — fix: replace as unknown as casts with named interfaces
- [#14](https://github.com/EdgarVz/psicoayuda-ve/pull/14) — fix: add id + htmlFor to consent checkbox for accessibility
- [#15](https://github.com/EdgarVz/psicoayuda-ve/pull/15) — feat: add migration SQL for years_experience column

### Checks
- lint PASS, tsc PASS, tests 81/81 PASS (18 suites)
- 11 archivos modificados/nuevos, +95/-20 líneas

## 2026-06-30 — DoD fixes post-sprint

### Problemas encontrados y corregidos
1. **middleware.ts no eliminado:** Block G migró lógica a `proxy.ts` pero `middleware.ts` quedó. Build fallaba con "Both middleware and proxy detected".
2. **Export name incorrecto:** Next.js 16 requiere `export function proxy` (no `middleware`) en `proxy.ts`.
3. **middleware.test.ts desactualizado:** importaba `middleware` desde `./proxy` — roto tras rename.
4. **@playwright/test no instalado:** `npx tsc --noEmit` fallaba con 6 errores (`Cannot find module '@playwright/test'`).
5. **Vercel Root Directory:** Configurado como `src/` → rutas `./src/src/middleware.ts`. Cambiar a ` ` (vacío) en Settings.

### Archivos modificados
- `src/middleware.ts` — **eliminado** (migrado a proxy.ts)
- `src/proxy.ts` — `export function proxy` (antes `middleware`)
- `src/middleware.test.ts` — importa `proxy` en vez de `middleware`
- `package.json` — `@playwright/test` añadido a devDependencies
- `BITACORA.md` — esta entrada

### DoD final
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ PASS |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm run build` | ✅ 9 rutas + Proxy |
| `npm test` | ✅ 81/81 (18 suites) |

---

## 2026-07-01 — Sesiòn de resoluciòn: discrepancias doc vs còdigo + deuda tècnica

### Plan ejecutado (5 bloques)

| Bloque | Descripciòn | Estado |
|--------|-------------|--------|
| 1 | Fixes ràpidos: `console.warn` duplicado en `resend.ts`, exclude `api/auth` de matcher proxy, actualizar `SMOKE-TEST.md` | ✅ en `develop` (`166ce13`) |
| 2 | 4 nuevos tests E2E Playwright (catàlogo, registro, login, CSP) | ✅ en `develop` (`9be5aab`) |
| 3 | Seed script `supabase/seed.sql` con datos reproducibles | ✅ en `develop` (`713881f`) |
| 4 | Migraciòn Storage buckets (`avatars`, `psychologist-documents`) | ✅ PR #18 abierto |
| 5 | `NEXT_PUBLIC_SITE_URL` documentado en `.env.example` + `ARCHITECTURE.md` | ✅ en `develop` |

### Lo que quedò en el camino
- Paseo `create_agent` no funciona en este entorno (timeout `app.agents` 10s) → worktrees creados pero agentes lanzados vía `task` subagent nativo
- Las branches `fix/e2e-tests` y `fix/seed-data` se mergearon localmente en lugar de via PR (error mío). Ya estàn en `develop`.
- `fix/storage-buckets` sì tiene PR: [#18](https://github.com/EdgarVz/psicoayuda-ve/pull/18)

### DoD final
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ PASS |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm run build` | ✅ 10 rutas + Proxy |
| `npm test` | ✅ 165/165 (33 suites) |

---

## 2026-07-01 — 4 features: rate limiting, WhatsApp link, edit profile

### Features implementadas

**Task 1 — Rate Limiting:**
- `withRateLimit` wrapper agregado a `src/lib/rate-limit.ts`
- Wrapped: `registerPsychologist` (5/min), `sendMagicLink` (3/min/email), `submitRequest` (10/min/user)
- `keyFn` soporta `string | Promise<string>` (async para derivar user ID de sesión)
- 5 tests unitarios PASS

**Task 2 — WhatsApp Link Post-Aprobación:**
- `WhatsAppButton` component creado con icono SVG + mensaje predeterminado
- `request-status.tsx` muestra el botón solo en status `accepted`
- Fallback text cuando el psicólogo no configuró su enlace

**Task 3 — Edit Profile:**
- Ruta `/dashboard/editar-perfil` con formulario completo
- Schema Zod `PsychologistProfileUpdateSchema` con validación de todos los campos
- Server Action `updatePsychologistProfile` con admin client
- Formulario `EditProfileForm` (nombre, bio, especialidades pill toggle, idiomas, WhatsApp, disponibilidad, experiencia)
- 2 tests unitarios (render + toggle especialidad)

### PRs
- [#19](https://github.com/EdgarVz/psicoayuda-ve/pull/19) — feat/rate-limiting → develop
- [#20](https://github.com/EdgarVz/psicoayuda-ve/pull/20) — feat/whatsapp-link → develop
- [#21](https://github.com/EdgarVz/psicoayuda-ve/pull/21) — feat/edit-profile → develop

---

## 2026-07-01 — Task 4: E2E tests con mocks de red

### Cambios
- Creados 3 fixtures JSON: `psychologists.json`, `psychologist-detail.json`, `requests.json`
- Creados 4 spec files: `catalog.spec.ts`, `registration.spec.ts`, `login.spec.ts`, `request-status.spec.ts`
- Tests usan `page.route()` + `route.fulfill()` para evitar dependencia de Supabase en vivo
- Registration spec: corregido `registrarme` → `registrarse`

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ PASS |
| `npm test` | ✅ 171/171 (34 suites) |

---

## 2026-07-04 — Fix: auth callback flow (Magic Link session cookie)

### Problema
Al hacer clic en el Magic Link, el usuario redirigía a `/login` en vez de iniciar sesión. Causa: `proxy.ts` lee la cookie `auth_logged_in` para determinar si el usuario está autenticado, pero ningún código la seteaba tras el login exitoso.

### Solución
Creado flujo de callback post-autenticación:

| Archivo | Descripción |
|---------|-------------|
| `src/app/(public)/auth/callback/page.tsx` | Client Component que procesa el token del Magic Link, llama al API para setear la cookie y redirige a `/dashboard` |
| `src/app/api/auth/set-cookie/route.ts` | Route Handler que setea `auth_logged_in=true` en cookie |
| `src/features/auth/actions.ts` | `emailRedirectTo` cambiado de `/dashboard` a `/auth/callback` |
| `src/proxy.ts` | `/auth/callback` agregado a rutas públicas |

### Flujo corregido
```
Email → clic en enlace → /auth/callback#access_token=xxx → procesa token → POST /api/auth/set-cookie → setea auth_logged_in → redirect a /dashboard → proxy ve cookie → permite acceso ✅
```

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run build` | ✅ 12 rutas + Proxy |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm test` | ✅ 171/171 (34 suites) |
| Commit | `fadbd39` |

---

## 2026-07-04 — Fix: dashboard vacío, navbar faltante, guard registro psicólogo + logout + error 500

### Problemas reportados

| Issue | Causa | Fix |
|-------|-------|-----|
| Dashboard paciente no muestra solicitudes enviadas | `getPatientRequests` usaba `psychologist_profiles!inner` — FK indirecta que PostgREST no puede resolver → inner join excluía todas las filas | Reemplazado por join directo a `profiles!psychologist_id_fkey` (FK directa) + query separada a `psychologist_profiles` para `whatsapp_link` |
| Dashboard sin navbar para volver a home o catálogo | Layout `(auth)` solo tenía auth guard, sin Navbar ni Footer | Agregado `<Navbar isLoggedIn />` + `<Footer />` al layout |
| Registro psicólogo permitía volver sin guard | Página pública sin verificación de perfil existente | Guard movido a Client Component vía server action `checkExistingProfile` |
| Error 500 al navegar | `createServerSupabase` en Server Components públicos causaba crash | Revertido a header check + check asíncrono en cliente |
| Sin botón cerrar sesión | Navbar no tenía opción de logout | Agregado `handleLogout` que llama `signOut()` + `clearAuthCookie()` + `router.push('/')` |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/features/dashboard/queries.ts` | `getPatientRequests` reescrito: join directo a `profiles` + segunda query para `whatsapp_link` |
| `src/features/dashboard/queries.test.ts` | Mock actualizado para reflejar las 2 queries separadas |
| `src/app/(auth)/layout.tsx` | Agregado `Navbar` + `Footer` |
| `src/app/(public)/registro-psicologo/page.tsx` | Check de login vía header `x-user-authenticated`, pasa `userLoggedIn` prop |
| `src/features/psychologist-registration/components/registration-form.tsx` | `useEffect` que llama `checkExistingProfile` en mount si hay sesión |
| `src/features/psychologist-registration/actions.ts` | Nueva Server Action `checkExistingProfile` |
| `src/features/layout/components/navbar.tsx` | Agregado botón "Cerrar sesión" con `handleLogout` |
| `src/features/layout/components/navbar.test.tsx` | Mock de `useRouter` agregado |

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ |
| `npm test` | ✅ |

---

## 2026-07-04 — Fix: getPatientRequests con queries planas, admin redirect, verify/reject

### Problemas y soluciones

| Issue | Causa | Fix |
|-------|-------|-----|
| Dashboard paciente seguía vacío tras fix anterior | `profiles!psychologist_id_fkey` — FK name incorrecto, PostgREST no resolvía join | `getPatientRequests` reescrito con 3 queries planas separadas (appointment_requests → profiles → psychologist_profiles) |
| Admin page no mostraba pendientes | Mismo FK join issue en `getPendingPsychologists` | Reescrito con queries separadas (profiles + psychologist_profiles) |
| Verificar/Rechazar no respondía | `createServerSupabase()` crasheaba en Server Actions en Vercel | Nuevo helper `checkAdminAuth` con try/catch + logger.warn |
| Login como admin iba a /dashboard | Auth callback no chequeaba admin_roles | `auth/callback/page.tsx` ahora consulta `admin_roles` y redirige a /admin si corresponde |
| Registro psicólogo redirect tardío | `useEffect` + server action tomaba segundos | Cambiado a estado `alreadyRegistered` que muestra mensaje "Ya estás registrado ⏳" de inmediato |
| Sin campo documento en registro | No hay upload de archivos en formulario actual | Issue conocido — el seed tiene `license_document` NULL |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/features/dashboard/queries.ts` | `getPatientRequests` con 3 queries planas |
| `src/features/dashboard/queries.test.ts` | Mock actualizado para 3 llamadas from() |
| `src/features/admin/actions.ts` | `getPendingPsychologists` con queries separadas; `checkAdminAuth` helper con try/catch |
| `src/features/psychologist-registration/actions.ts` | `checkExistingProfile` con try/catch |
| `src/features/psychologist-registration/components/registration-form.tsx` | Estado `alreadyRegistered` con mensaje + botón |
| `src/app/(public)/auth/callback/page.tsx` | Redirección a /admin si tiene admin_roles |

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 12 rutas + Proxy |
| `npm test` | ✅ 174/174 (34 suites) |

---

## 2026-07-04 — Fix: pending null filter, email registro, field hints, template API

### Cambios
- **Pending psychologists**: filtro `=== false` no matcheaba `null`. Cambiado a `!p.license_verified` + try/catch + logging.
- **Email registro**: nuevo correo "Registro recibido - PsicoAyuda VE" al psicólogo vía Resend.
- **Field hints**: asteriscos rojos en labels obligatorios, "Mínimo 3 caracteres", "Mínimo 4 caracteres", contador `biography.length/1000`, "Ej: 9:00 - 15:00".
- **Email templates (Supabase Auth)**: las plantillas de Magic Link y Confirmación se configuran en Supabase Dashboard → Authentication → Email Templates. No se pudo vía Management API por falta de `SUPABASE_ACCESS_TOKEN`.
- **Resend**: para enviar correos a usuarios reales se requiere un dominio verificado. Opción recomendada: Vercel Marketplace → Resend Integration para obtener `RESEND_API_KEY`.

### Archivos modificados
`admin/actions.ts`, `registration-form.tsx`, `registration-form.test.tsx`, `psychologist-registration/actions.ts`

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 12 rutas + Proxy |
| `npm test` | ✅ 174/174 (34 suites) |

---

## 2026-07-04 — WCAG contraste, mobile menu, registro campos, email notifications, empty state

### Cambios

**Accesibilidad (WCAG)**
- `globals.css`: `--color-muted-foreground` de `#B0A89C` → `#6B5E54` (WCAG AA 4.5:1)
- Reemplazados 44 usos de `text-muted` (#F5F0EA, ilegible) por `text-muted-foreground` en 20 archivos
- Corregido `text-warning` → `text-warning-text` en badges "Pendiente" (`requests-list.tsx`, `stats-cards.tsx`)

**Mobile menu** — `navbar.tsx`: hamburguer con `useState` toggle + panel de navegación con mismos links. Icono cambia a ✕ al abrir.

**Registro psicólogo** — 3 campos obligatorios agregados:
- `biography` (textarea, min 10 chars)
- Idiomas de atención (toggle: español/inglés/portugués/francés)
- Disponibilidad (días Lun–Sáb + horario)
- Schema, action, form y tests actualizados
- Botón submit con `animate-pulse` durante envío

**Email notifications** — 3 nuevos correos vía Resend:
- `verifyPsychologist`: "Perfil verificado - PsicoAyuda VE" al psicólogo
- `rejectPsychologist`: "Registro rechazado - PsicoAyuda VE" al psicólogo
- `rejectRequest`: "Cita rechazada - PsicoAyuda VE" al paciente
- Todos con try/catch y progressive fallback

**Empty state dashboard** — Mensaje más cálido: "Mientras tanto, revisa tu disponibilidad o actualiza tu perfil..."

### Archivos modificados
`globals.css`, `navbar.tsx`, `schemas.ts`, `schemas.test.ts`, `registration-form.tsx`, `actions.ts`, `actions.test.ts`, `appointments/actions.ts`, `admin/actions.ts`, `psychologist-profile.tsx`, `psychologist-card.tsx`, `requests-list.tsx`, `stats-cards.tsx`, `footer.tsx`, `edit-profile-form.tsx`, `request-form.tsx`, `request-status.tsx`, `magic-link-form.tsx`, `patient-dashboard.tsx`, `psychologist-dashboard.tsx`, `psychologist-list.tsx`, `verification-detail.tsx`, `pending-verification.tsx`, `page.tsx` (varios), `error.tsx`, `not-found.tsx`

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 12 rutas + Proxy |
| `npm test` | ✅ 174/174 (34 suites) |

---

## 2026-07-05 — Plan de robustez operativa

### Sesión
Brainstorming + diseño + plan de implementación para 5 áreas de robustez:
1. **Notificaciones In-App** — tabla `notifications` + RLS + badge/dropdown en navbar + página de historial
2. **RLS Policies** — policies para `appointment_requests` (psicólogo ve solo suyas, paciente ve solo suyas)
3. **Loading States** — spinners + disabled en botones de formularios (accept/reject, solicitar cita, verify/reject psicólogo)
4. **Onboarding** — página `/como-funciona` con FAQ accordion + empty states mejorados en dashboard
5. **QA** — test E2E de flujo completo + page objects

### Decisiones técnicas
- Notificaciones In-App como tabla con polling en Server Component (sin Realtime)
- `createNotification` usa admin client (bypass RLS), llamada desde Server Actions existentes
- Resend ya está cableado para cuando se configure `RESEND_API_KEY`
- Se usará TDD para toda implementación nueva

### Artefactos creados
- `docs/superpowers/specs/2026-07-05-robustez-notificaciones-rls-onboarding-design.md`
- `docs/superpowers/plans/2026-07-05-robustez-implementation.md`

### Implementación (worktree `feat/robustez-notificaciones-rls`)
Los 10 tasks ejecutados con subagent-driven development + TDD:

| Task | Archivos | Tests |
|------|----------|-------|
| 1. DB Migration | `notifications` table + enum + RLS | 175/175 |
| 2. Types & Schemas | `types.ts`, `schemas.ts` + tests | 182/182 |
| 3. Actions & Queries | `actions.ts`, `queries.ts` + tests | 198/198 |
| 4. Wire notifications | 6 Server Actions modificados | 198/198 |
| 5. UI Badge + Dropdown | `NotificationItem`, `NotificationDropdown`, Navbar | 205/205 |
| 6. Notification list page | `/dashboard/notificaciones` con paginación | 206/206 |
| 7. Loading states | spinners en todos los botones de acción | 206/206 |
| 8. Onboarding | FAQ accordion + `/como-funciona` + empty states | 209/209 |
| 9. E2E | `full-flow.spec.ts` (7 tests) | 7/7 E2E |
| 10. Verificación | lint + tsc + build + test + E2E | ✅ |

### Checks finales
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ 0 errores, 0 warnings |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 14 rutas + Proxy |
| `npm test` | ✅ 209/209 (42 suites) |
| E2E full-flow | ✅ 7/7 passed |

---

## 2026-07-06 — Fix: dashboard psicólogo vacío + catálogo + admin solicitudes

### Fix 1: Dashboard psicólogo no mostraba solicitudes
**Causa:** `getPsychologistRequests` usaba `profiles!inner` (join anidado) pero `appointment_requests` tiene dos FKs a `profiles` (`patient_id` y `psychologist_id`). PostgREST no resolvía la ambigüedad y retornaba vacío.

**Fix:** Refactorizado al mismo patrón que `getPatientRequests` — query separada de `appointment_requests` + query separada de `profiles` para nombres de pacientes + merge en JS. Se eliminó `NestedPatientProfile`.

**Email:** `RESEND_API_KEY` configurada pero dominio `psicoayuda.org.ve` no verificado en Resend. Usar `onboarding@resend.dev` para dev o verificar en https://resend.com/domains.

### Fix 2: Filtro de especialidad en `/psicologos`

### Fix 1: Filtro de especialidad en `/psicologos`
**Causa:** `useState(initialPsychologists)` en `catalog-client.tsx` ignoraba el nuevo prop al re-renderizar del servidor tras cambiar `searchParams`.

**Fix:** Eliminado `useState`, usa `initialPsychologists` directamente del prop.

### Fix 2: Admin no veía solicitudes de cita
**Causa:** Página `/admin` solo tenía la sección de verificaciones de psicólogos. Nunca se implementó la vista de solicitudes de cita. RLS bloqueaba queries de admins.

**Fix:**
- `types.ts`: nuevo tipo `AdminAppointmentRequest`
- `actions.ts`: nueva `getAllAppointmentRequests()` con admin client (bypass RLS)
- Nuevo componente `appointment-requests-table.tsx` (tabla con paciente, psicólogo, motivo, estado, fecha)
- `admin/page.tsx`: nueva sección "Solicitudes de cita"
- Instalado `@testing-library/user-event` que faltaba (3 suites fallaban)

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ (solo preexistentes) |
| `npm run build` | ✅ 14 rutas + Proxy |
| `npm test` | ✅ 209/209 (42 suites) |

---

## 2026-07-06 — Fix: discrepancias doc-código y deuda técnica

### Cambios
- `src/proxy.ts`: agregado `/como-funciona` a `publicPaths` y `api/auth` al matcher exclusion
- `src/middleware.test.ts`: nuevo test para ruta pública `/como-funciona`
- `docs/superpowers/plans/2026-07-01-four-features.md`: marcados todos los checkboxes como `[x]`
- `docs/superpowers/plans/2026-07-05-robustez-implementation.md`: marcados todos los checkboxes como `[x]`
- Rama `feat/robustez-notificaciones-rls` eliminada (local + remoto + worktree Paseo)

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 14 rutas + Proxy |
| `npm test` | ✅ 210/210 (42 suites) |

---

## 2026-07-05 — UI: mostrar mínimo de caracteres en "Sobre ti"

### Cambio
`src/features/psychologist-registration/components/registration-form.tsx`: agregado `(mín. 10)` al contador de caracteres del campo `biography` cuando está por debajo del mínimo.

---

## 2026-07-04 — Fix: catálogo mostraba "Usuario" en vez del nombre del psicólogo

### Problema
Al registrar un psicólogo nuevo, el `profiles.display_name` quedaba como "Usuario" (valor por defecto del trigger `handle_new_user`), mientras que el nombre real estaba en `psychologist_profiles.full_name`. El catálogo usaba `display_name` de `profiles`.

### Fix
`src/features/catalog/queries.ts`: agregado `full_name` al select de `psychologist_profiles`, `displayName` ahora usa `psy.full_name || row.display_name`.

### Checks
| Check | Resultado |
|-------|-----------|
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ 12 rutas + Proxy |
| `npm test` | ✅ 171/171 (34 suites) |
