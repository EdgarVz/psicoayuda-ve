# Prompts — PsicoAyuda VE

Guía de uso: prompts modulares y específicos del proyecto. Si existe un skill relevante (brainstorming, debugging, TDD, etc.), cárgalo primero con la herramienta skill.

No es un registro histórico. Es una caja de herramientas viva.

---

## 📋 Flujo de Trabajo Diario

### Calibración
Lee `SOUL.md`, `USER.md`, `AGENTS.md`, `DESIGN.md`, `ARCHITECTURE.md` y confirma que entiendes identidad, contexto, restricciones, tokens visuales y stack. Da visto bueno breve.

### Análisis Completo
Sin modificar archivos: lee todos los docs relevantes. Ejecuta `npm run lint`, `npx tsc --noEmit`, `npm run build`. Reporta: estado comandos, roadmap, discrepancias doc vs código, deuda técnica visible.

Al final del reporte, pregunta "¿Qué modalidad de trabajo deseas hoy?" con menú:

1. **Desarrollo interactivo** — TDD + validación por paso
2. **Code review** — Revisión multi-dimensión del diff actual
3. **Planificación semanal** — Priorización táctica
4. **Verificación post-tarea** — DoD + smoke test
5. **Commit y push** — git status + mensaje Conventional Commits

### Inicio de Feature
Indica alcance, archivos a crear/modificar, riesgos. Implementa respetando AGENTS.md. Al terminar: DoD + resumen + docs que necesitan actualización.

### Corrección de Bug
Reproduce mentalmente el bug, explica causa raíz, propone solución. Tras aprobación: implementa y verifica sin regresiones.

### Commit y Push
`git status`, resume cambios, redacta mensaje Conventional Commits en español, commit y push.

---

## 🧩 Templates Base por Tipo de Tarea

### Server Action

Crea server action en `features/[dominio]/actions.ts` que [función].

- `'use server'` en archivo separado
- Validación Zod de entrada
- Auth check con `auth()` de `lib/supabase/server.ts`
- Retorna `{ data?, error }`
- Logger con `lib/logger.ts`

```typescript
export async function actionName(input: InputType): Promise<ActionResult> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  const { data, error } = await supabase.from('table').insert(parsed.data)
  if (error) { logger.error('action failed', { error }); return { error: 'Error al procesar' } }

  revalidatePath('/ruta')
  return { data }
}
```

### API Route

Crea API Route en `app/api/[ruta]/route.ts`.

- Método HTTP explícito
- Auth check si modifica datos
- Validación Zod
- Rate limiting si aplica (`lib/rate-limit.ts`)
- Respuesta: `NextResponse.json({ data?, error }, { status })`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { schema } from './schema'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await rateLimit(ip)
  if (!success) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })

  const supabase = await createServerSupabase()
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const { data, error } = await supabase.from('table').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
```

### Client Component

Crea componente en `features/[dominio]/components/[nombre].tsx`.

- `'use client'` solo si necesita estado o efectos
- Props tipadas con `interface`
- TailwindCSS, responsive mobile-first
- Estados: loading, empty, error, success

```typescript
'use client'

interface ComponentProps {
  items: Item[]
  onSelect?: (item: Item) => void
}

export function ComponentName({ items, onSelect }: ComponentProps) {
  if (items.length === 0) return <EmptyState icon={Search} title="Sin resultados" description="Ajusta los filtros" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.id} onClick={() => onSelect?.(item)} className="..." />
      ))}
    </div>
  )
}
```

### Server Component (RSC)

Crea página en `app/[ruta]/page.tsx`.

- `async` function, consulta datos directamente
- `export const metadata` para SEO
- NotFound si datos no existen
- Manejo de errores via `error.tsx`

```typescript
import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Component } from '@/features/dominio/components/component'

export const metadata = { title: 'Título', description: 'Descripción' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('table').select('*').eq('id', id).single()
  if (!data) notFound()

  return <Component item={data} />
}
```

### Zustand Store

Crea store en `features/[dominio]/store.ts`.

```typescript
import { create } from 'zustand'

interface StoreState {
  filters: Record<string, unknown>
  resultCount: number
  setFilter: (key: string, value: unknown) => void
  clearFilters: () => void
}

export const useStore = create<StoreState>((set) => ({
  filters: {},
  resultCount: 0,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: {} }),
}))
```

### Zod Schema

Crea schema en `features/[dominio]/schemas.ts`.

- Mensajes de error en español
- Validaciones específicas del dominio
- Re-exportar tipos inferidos

```typescript
import { z } from 'zod'

export const schemaName = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().regex(/^\+58\d{10}$/, 'Formato: +58XXXXXXXXXX'),
})

export type SchemaName = z.infer<typeof schemaName>
```

---

## 🛠️ Prompts Específicos por Módulo

### Auth (Magic Links)
- `features/auth/schemas.ts` — `magicLinkSchema` (email), `psychologistSignupSchema` (email, display_name, full_name, license_number)
- `features/auth/actions.ts` — Server actions: `sendMagicLink(email)`: llama a `supabase.auth.signInWithOtp({ email })`. `signOut()`: `supabase.auth.signOut()` + limpia cookie
- `app/login/page.tsx` — Solo input email + botón "Enviar enlace mágico". Sin contraseñas, sin Google OAuth
- `middleware.ts` — security headers + auth check + admin check via `admin_roles`

### Psychologist Catalog
- `features/catalog/store.ts` — Zustand: filters (specialties, availability, language), resultCount, setFilter, clearFilters
- `features/catalog/queries.ts` — `getPsychologists(filters)`: profiles WHERE role='psychologist' + join psychologist_profiles WHERE license_verified=true. Filter por specialties (array containment), availability, language. Order by is_available desc
- `features/catalog/components/psychologist-card.tsx` — Card horizontal: avatar left (w-24 h-24 rounded-full), info right (name, specialties como badges, languages, availability indicator green/gray). Botón "Conectar". Estado "Disponible ahora" / "Vuelve pronto · Horario"
- `features/catalog/components/psychologist-list.tsx` — Grid 1/2/3 cols responsive. Loading skeleton. Empty state: "No hay psicólogos disponibles en este momento"
- `features/catalog/components/specialty-filter.tsx` — Filter chips para especialidades. Multi-select. Estilo badges seleccionables
- `app/page.tsx` — RSC: Hero + preview de psicólogos disponibles (top 6)
- `app/psicologos/page.tsx` — RSC: Catálogo completo con filtros + grid paginado

### Psychologist Detail
- `features/psychologist/queries.ts` — `getPsychologistById(id)` join profiles + psychologist_profiles
- `features/psychologist/components/psychologist-profile.tsx` — Avatar grande, nombre, especialidades, biografía, verificación badge, disponibilidad horaria. Botón grande "Solicitar contacto vía WhatsApp" (#25d366)
- `app/psicologo/[id]/page.tsx` — RSC con metadata dinámica. NotFound si no existe o no verificado

### Appointment Request
- `features/appointments/schemas.ts` — `appointmentRequestSchema` (psychologist_id uuid, patient_age int 10-120, reason specialty[] min 1, preferred_schedule optional, consent_granted literal true). Sin patient_name (viene de profiles.display_name vía JOIN)
- `features/appointments/actions.ts` — `submitRequest(data)`: INSERT appointment_requests status='pending'. Notificar psicólogo vía email (Resend). `acceptRequest(id)` y `rejectRequest(id)`: update status. En accept: reveal wa.me link
- `features/appointments/components/request-form.tsx` — Formulario en `/solicitar/[id]`: edad, motivo (checkboxes), preferencia horario, checkbox consentimiento. Submit button. Estados: idle → submitting → success/error
- `features/appointments/components/request-status.tsx` — Pantalla post-solicitud `/solicitud/[id]`: "Tu solicitud ha sido enviada." Si aceptada: botón wa.me link. Si rechazada: mensaje cordial
- `app/solicitar/[id]/page.tsx` — RSC: form paso a paso con validación Zod
- `app/solicitud/[id]/page.tsx` — RSC: muestra estado actual de la solicitud

### Psychologist Dashboard
- `features/dashboard/queries.ts` — `getPsychologistRequests(psychologistId)`: appointment_requests WHERE psychologist_id. Incluye patient data. Status filter
- `features/dashboard/components/requests-list.tsx` — Lista de solicitudes con nombre paciente, edad, motivo, fecha. Botones Aceptar/Rechazar. Si aceptada: muestra wa.me link del psicólogo
- `features/dashboard/components/profile-editor.tsx` — Editar disponibilidad, especialidades, biografía, WhatsApp link. Upload foto
- `features/dashboard/components/stats-cards.tsx` — Total solicitudes, aceptadas, pendientes
- `app/dashboard/page.tsx` — Auth check psychologist role. Layout con sidebar

### Admin Panel
- `features/admin/actions.ts` — `verifyPsychologist(profileId, approved)`: update license_verified. `rejectPsychologist(profileId, reason)`: update con motivo
- `features/admin/components/pending-verification.tsx` — Lista de psicólogos no verificados. Foto, nombre, license_number, documento subido. Botones Verificar/Rechazar
- `features/admin/components/verification-detail.tsx` — Modal o drawer viendo el documento del psicólogo + datos completos. Acciones
- `app/admin/*` — Layout independiente (sin navbar/footer público). Sidebar con secciones

---

## ✅ Verificación Post-Tarea

Revisa que los cambios:
- Respeten AGENTS.md (imports @/, tipado, Zod, español, RLS, privacidad)
- No tengan `any`, `console.log`, código duplicado, imports no usados
- Incluyan tests para lógica nueva y endpoints

Ejecuta DoD:
```
npm run lint && npx tsc --noEmit && npm run build
```
