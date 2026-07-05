# Diseño: Robustez operativa — Notificaciones, RLS, Onboarding y QA

**Fecha:** 2026-07-05
**Estado:** Aprobado

## Resumen

5 áreas para llevar PsicoAyuda VE de funcional a robusto: notificaciones
In-App (capa inmediata), RLS policies faltantes, loading states,
onboarding/FAQ, y test E2E de flujo completo.

---

## 1. Notificaciones In-App

### 1.1 Tabla `notifications`

```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  related_id uuid,                -- opcional: id de la solicitud/request relacionada
  read_at timestamptz,            -- NULL = no leída
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE notification_type AS ENUM (
  'request_received',      -- psicólogo: nuevo paciente solicitó cita
  'request_accepted',      -- paciente: tu cita fue aceptada
  'request_rejected',      -- paciente: tu cita fue rechazada
  'profile_verified',      -- psicólogo: perfil verificado por admin
  'profile_rejected'       -- psicólogo: registro rechazado por admin
);
```

### 1.2 RLS

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_update_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- solo permite UPDATE en read_at; INSERT solo desde service_role/admin
```

### 1.3 Disparo desde Server Actions

En cada Server Action que cambia estado, **además del email existente**, se
llama a `createNotification` (usa admin client para bypassear RLS):

| Acción | type | user_id | title |
|--------|------|---------|-------|
| `submitRequest` | `request_received` | psicólogo | "Nueva solicitud de ayuda" |
| `acceptRequest` | `request_accepted` | paciente | "Solicitud aceptada" |
| `rejectRequest` | `request_rejected` | paciente | "Solicitud rechazada" |
| `verifyPsychologist` | `profile_verified` | psicólogo | "Perfil verificado" |
| `rejectPsychologist` | `profile_rejected` | psicólogo | "Registro rechazado" |

### 1.4 UI

- **Badge en Navbar**: contador de no-leídas, consultado desde layout (Server
  Component), pasa como prop al Client Component `Navbar`
- **Dropdown de notificaciones**: al hacer clic en campana, últimas 5
  notificaciones con botón "Marcar como leídas"
- **Página `/dashboard/notificaciones`**: historial completo con paginación,
  cada ítem enlace a la entidad relacionada si aplica
- **Sin Realtime**: polling al cargar página (Server Component). Suficiente
  para este contexto.

### 1.5 Archivos

```
src/features/notifications/
  types.ts          — NotificationRow, NotificationType
  schemas.ts        — createNotificationSchema, markAsReadSchema
  actions.ts        — createNotification (admin), markAsRead (user)
  queries.ts        — getUnreadCount, getNotifications
  components/
    notification-badge.tsx      — badge con contador + dropdown
    notification-list.tsx       — lista paginada
    notification-item.tsx       — item individual
```

---

## 2. RLS Policies

### 2.1 `appointment_requests`

```sql
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- Paciente: solo ve sus propias solicitudes
CREATE POLICY "patient_select_own" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

-- Psicólogo: solo ve solicitudes dirigidas a él
CREATE POLICY "psychologist_select_own" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (psychologist_id = auth.uid());

-- Paciente: solo inserta con su propio patient_id
CREATE POLICY "patient_insert_own" ON public.appointment_requests
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Psicólogo: solo actualiza solicitudes dirigidas a él
CREATE POLICY "psychologist_update_own" ON public.appointment_requests
  FOR UPDATE TO authenticated
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());
```

### 2.2 Migración

Archivo único: `supabase/migrations/20260705000001_add_rls_and_notifications.sql`

### 2.3 Seguridad adicional

- Validación Zod existente en `appointment_requests` cubre `patient_age` (min 10,
  max 120) y `reason` (enum array). Confirmado que ya existe ✅
- `consent_granted` con CHECK constraint en DB ya existente ✅

---

## 3. Loading States y UX

### 3.1 Botones con carga

| Formulario | Componente | Estado actual |
|------------|-----------|---------------|
| Registro psicólogo | `registration-form.tsx` | `useActionState` + `pending` + `disabled` + `animate-pulse` ✅ |
| Solicitar cita | `request-form.tsx` | ❌ Sin loading |
| Aceptar solicitud | `pending-verification.tsx` | ❌ Sin loading |
| Rechazar solicitud | `pending-verification.tsx` | ❌ Sin loading |
| Magic Link login | `magic-link-form.tsx` | ❌ Sin loading |

**Patrón a aplicar**: `useActionState` + botón `disabled` cuando `pending` +
texto cambia a "Enviando…" / "Aceptando…" / "Rechazando…".

### 3.2 Protección doble envío

`useActionState` ya lo maneja: el `pending` se setea antes de la primera
ejecución y no se resetea hasta que termina. Botón `disabled={pending}`.

### 3.3 WhatsApp botón

Ya existe validación `req.status === 'accepted'` en `requests-list.tsx` ✅
Adicional: ocultar también si `whatsappLink` es null/undefined.

---

## 4. Onboarding

### 4.1 Página `/como-funciona`

Ruta pública con secciones en accordion:

1. **¿Qué es PsicoAyuda VE?** — breve descripción del servicio gratuito
2. **¿Cómo solicito ayuda?** — 3 pasos: registrarse, elegir psicólogo, enviar
   solicitud
3. **¿Qué pasa después de enviar mi solicitud?** — explicación del ciclo:
   pendiente → aceptado/rechazado → WhatsApp
4. **¿Es confidencial?** — política de privacidad y consentimiento
5. **¿Cuánto cuesta?** — es gratuito, psicólogos voluntarios
6. **¿Quiero ser voluntario?** — link a registro de psicólogo

### 4.2 Empty states mejorados

Los empty states actuales en `requests-list.tsx` ya muestran texto amigable.
Mejora: cambiar "Mientras tanto, revisa tu disponibilidad..." por mensajes
diferenciados:

- **Psicólogo sin solicitudes**: "Aún no has recibido solicitudes. Asegúrate
  de que tu perfil esté completo para que los pacientes te encuentren."
- **Paciente sin solicitudes**: "No has enviado ninguna solicitud aún.
  Explora nuestro catálogo de psicólogos y da el primer paso."

### 4.3 Navbar link

Agregar enlace "¿Cómo funciona?" en navbar público.

### 4.4 Archivos

```
src/app/(public)/como-funciona/page.tsx    — Server Component
src/features/onboarding/
  components/faq-accordion.tsx             — 'use client', acordeón reutilizable
```

---

## 5. QA — Test E2E de flujo completo

### 5.1 Nuevo spec: `e2e/full-flow.spec.ts`

Flujo punta a punta usando datos de prueba:

1. **Visitar home** → hero visible
2. **Registrarse como paciente** → crear usuario via Supabase Auth (test helper)
3. **Ver catálogo** → listar psicólogos
4. **Seleccionar psicólogo** → ver detalle
5. **Enviar solicitud** → status pending
6. **Login como psicólogo** (otro usuario) → ver solicitud pendiente
7. **Aceptar solicitud** → status accepted
8. **Verificar** → botón WhatsApp visible en dashboard del paciente
9. **Verificar** → botón WhatsApp con link correcto

### 5.2 Estrategia

- Usar `test` helpers de Playwright con autenticación directa (JWT mock o
  `supabase.auth.admin.createUser`)
- Datos de prueba en `e2e/fixtures/`
- No depende de Resend ni servicios externos
- Se ejecuta contra base de datos de preview/development

---

## 6. Resend — estado actual

El código de email transaccional ya está implementado en:

- `src/lib/resend.ts` — cliente con fallback si falta `RESEND_API_KEY`
- `src/appointments/actions.ts` — `acceptRequest`, `rejectRequest`, `submitRequest`
- `src/admin/actions.ts` — `verifyPsychologist`, `rejectPsychologist`
- `src/psychologist-registration/actions.ts` — `registerPsychologist`

El `from` usa `notificaciones@psicoayuda.org.ve`. Para habilitar envíos reales:

1. Verificar dominio `psicoayuda.org.ve` en Resend (DNS TXT record)
2. Setear `RESEND_API_KEY` en entorno de producción (Vercel)
3. Los emails se activan automáticamente — no requiere cambios de código

---

## 7. Archivos afectados (resumen)

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260705000001_add_rls_and_notifications.sql` | Nueva migración: tabla + RLS |
| `src/features/notifications/types.ts` | Nuevo |
| `src/features/notifications/schemas.ts` | Nuevo |
| `src/features/notifications/actions.ts` | Nuevo |
| `src/features/notifications/queries.ts` | Nuevo |
| `src/features/notifications/components/notification-badge.tsx` | Nuevo |
| `src/features/notifications/components/notification-list.tsx` | Nuevo |
| `src/features/notifications/components/notification-item.tsx` | Nuevo |
| `src/features/appointments/actions.ts` | + createNotification en cada acción |
| `src/features/admin/actions.ts` | + createNotification en verify/reject |
| `src/features/psychologist-registration/actions.ts` | + createNotification registro |
| `src/features/layout/components/navbar.tsx` | + badge notificaciones + link "¿Cómo funciona?" |
| `src/app/(auth)/dashboard/notificaciones/page.tsx` | Nueva página |
| `src/app/(public)/como-funciona/page.tsx` | Nueva página |
| `src/features/onboarding/components/faq-accordion.tsx` | Nuevo |
| `src/features/appointments/components/request-form.tsx` | + useActionState loading |
| `src/features/appointments/components/whatsapp-button.tsx` | + null/empty check |
| `src/features/dashboard/components/requests-list.tsx` | Empty states mejorados |
| `src/features/auth/components/magic-link-form.tsx` | + loading state |
| `e2e/full-flow.spec.ts` | Nuevo test E2E |
| `e2e/fixtures/` | Datos de prueba para E2E |

---

## 8. Definition of Done

- `npm run lint` sin errores
- `npx tsc --noEmit` sin errores
- `npm run build` exitoso
- `npm test` todos los tests pasan (incluyendo nuevos)
- `npx playwright test` E2E pasan
- Sin `any` ni `console.log` fuera del logger
