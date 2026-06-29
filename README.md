# PsicoAyuda VE

Plataforma de apoyo psicológico en crisis para Venezuela. Conecta pacientes con psicólogos voluntarios vía WhatsApp de forma rápida, segura y privada.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui v4, Zustand 5
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Conexión:** WhatsApp (wa.me) — único canal de contacto
- **Monitoreo:** Sentry (condicional)
- **Infra:** Vercel + Resend (notificaciones)
- **Design System:** shadcn/ui + tokens personalizados

## Requisitos

- Node.js 20+
- Cuentas en: GitHub, Vercel, Supabase, Resend

## Setup

1. `git clone <url>`
2. `cp .env.example .env.local` y llenar variables (RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY)
3. `npm install`
4. `npm run dev`

## Scripts

| Comando | Propósito |
|---------|-----------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Tests (Vitest) |

## Documentación del proyecto

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Reglas para asistentes IA |
| `SOUL.md` | Identidad y tono del agente |
| `USER.md` | Contexto del usuario |
| `BITACORA.md` | Bitácora del proyecto |
| `DESIGN.md` | Brand contract — diseño visual |
| `SECURITY.md` | Políticas de seguridad |
| `CONTRIBUTING.md` | Guía de contribución |
| `RUNBOOK.md` | Operaciones y rollback |
| `SMOKE-TEST.md` | Smoke tests pre-release |
| `docs/adr/` | Decisiones arquitectónicas |
| `docs/superpowers/specs/` | Especificaciones de diseño |
| `docs/superpowers/plans/` | Planes de implementación |
