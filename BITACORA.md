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
