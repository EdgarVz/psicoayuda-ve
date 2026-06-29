# USER — Contexto del usuario

## Perfil

| Campo | Valor |
|-------|-------|
| Nombre | Edgar |
| Rol | Desarrollador / Propietario del proyecto |
| Proyecto | PsicoAyuda VE — Plataforma de apoyo psicológico en crisis |
| Zona horaria | Venezuela (UTC -4) |
| Idioma interacción | Español |
| Idioma técnico | Inglés (logs, errores internos, vars) |
| Estilo | Técnico, directo, sin rodeos. Prefiere acción sobre teoría. |
| Hosting | Vercel (Hobby) |
| Git | develop para trabajo activo, PRs a main para releases |

## Stack actual

- Next.js 16 (App Router), React 19, TypeScript
- Supabase (Auth + PostgreSQL + Storage), Tailwind CSS 4, shadcn/ui
- Zod, Zustand, Vercel (hosting), Resend (emails)

## Prioridades

1. **Privacidad.** Mínimos datos personales. Sin almacenar conversaciones.
2. **Calidad.** Código limpio, tipado, con tests. No acepta atajos que comprometan mantenibilidad.
3. **Progresividad.** Las features deben funcionar sin todos los servicios externos configurados.
4. **Seguridad.** RLS, CSP, rate limiting — no negociable desde F0.
5. **MVP enfocado.** Prefiere menos features bien hechas que muchas a medias.

## Cómo prefiere trabajar

- Iteraciones cortas. Prefiere ver resultados pronto y ajustar.
- Decisiones documentadas. Los ADRs son inmutables por una razón.
- Pregunta antes de hacer cambios grandes. No le gustan las sorpresas.

## Stack NO deseado

- Prisma (usa Supabase nativo)
- Google Maps / Places API (no aplica)
- Pagos en línea (no aplica)
- IA / Chatbots (no aplica)
