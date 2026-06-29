# ADR 001: No Prisma — Cliente Supabase Nativo

**Fecha:** 2026-06-05
**Estatus:** Aprobado

## Contexto
El stack usa Supabase como backend (PostgreSQL + Auth + Storage). Prisma es el ORM más popular del ecosistema Next.js y ofrece tipos generados, migrations y query builder. Sin embargo, añade una capa de abstracción entre la app y Supabase que compite con las herramientas nativas del ecosistema.

## Decisión
Usar el cliente nativo `@supabase/supabase-js` con tipos generados via `supabase gen types --lang=typescript`. No instalar Prisma.

Justificación técnica:
- Supabase genera tipos TypeScript directamente desde el esquema SQL (`supabase gen types`), logrando el mismo beneficio que Prisma sin capa extra.
- RLS (Row Level Security) es el mecanismo de autorización central. Con Prisma, RLS se aplica a nivel DB pero el cliente no la respeta a menos que uses `@supabase/supabase-js`. Si usas Prisma desde el servidor, podrías eludir RLS accidentalmente.
- Las migrations de Supabase (`supabase migration new`) son SQL plano con menos overhead que Prisma Migrate.
- Un ORM adicional aumenta el bundle del lado del serviente y añade una dependencia más que auditar.

## Consecuencias
- (+) Menos dependencias, menos capas de abstracción.
- (+) RLS se respeta siempre por diseño.
- (+) Migraciones SQL nativas, más control.
- (-) El equipo debe escribir SQL directamente (RLS policies, queries complejas).
- (-) Sin query builder tipado — las consultas SQL raw hay que mantenerlas.
- (-) Sin `prisma studio` — se reemplaza con Supabase Dashboard o `psql`.
