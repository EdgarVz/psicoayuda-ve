# PsicoAyuda VE — Design Spec

> Plataforma de apoyo psicológico en crisis para Venezuela.
> Enfoque: Vertical Slice + Database-first. Magic Links como único método de auth.
> Conexión exclusiva vía WhatsApp con aprobación previa.

---

## 1. Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| Lenguaje | TypeScript | 5 |
| Base de datos | PostgreSQL | — |
| Auth | Supabase Auth (Magic Link) | — |
| Almacenamiento | Supabase Storage | — |
| ORM | Cliente Supabase nativo | — |
| Validación | Zod | 4 |
| State management | Zustand | 5 |
| CSS | Tailwind CSS + shadcn/ui | 4 |
| Emails | Resend | — |
| Monitoreo | Sentry | 9 (condicional) |
| Hosting | Vercel | Free tier |
| Tipografía | Geist (Variable, self-hosted) | — |

---

## 2. Modelo de datos

### Enums

```sql
CREATE TYPE user_role AS ENUM ('psychologist', 'patient');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE specialty AS ENUM (
  'duelo', 'ansiedad', 'crisis_panico', 'trauma',
  'apoyo_ninos', 'apoyo_adolescentes', 'depresion',
  'estres', 'violencia', 'adicciones'
);
```

### Tablas

#### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK → auth.users.id | |
| role | user_role | 'psychologist' \| 'patient' |
| display_name | text NOT NULL | Nombre o apodo |
| avatar_url | text | Foto de perfil (Storage público) |
| timezone | text DEFAULT 'America/Caracas' | |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

#### `psychologist_profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK → profiles.id | |
| full_name | text NOT NULL | |
| license_number | text NOT NULL UNIQUE | Número de colegiado |
| license_document | text | URL Storage privado |
| license_verified | boolean DEFAULT false | Solo admin escribe |
| biography | text | |
| specialties | specialty[] | |
| languages | text[] DEFAULT '{"español"}' | |
| whatsapp_link | text | Validado: `wa.me/\+58\d+` |
| availability | jsonb | `[{day, start, end}]` |
| is_available | boolean DEFAULT true | |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

#### `appointment_requests`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | |
| psychologist_id | uuid FK → profiles.id NOT NULL | |
| patient_id | uuid FK → profiles.id NOT NULL | |
| patient_age | int CHECK (10-120) | |
| reason | specialty[] NOT NULL | |
| preferred_schedule | text | |
| status | request_status DEFAULT 'pending' | |
| consent_granted | boolean NOT NULL CHECK (= true) | |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

#### `admin_roles`
| Columna | Tipo |
|---------|------|
| id | uuid PK |
| user_id | uuid FK → auth.users UNIQUE |
| created_at | timestamptz DEFAULT now() |

### RLS Policies (críticas)

```sql
-- Profiles: lectura pública de psicólogos verificados
CREATE POLICY "public_read_verified_psychologists" ON profiles
  FOR SELECT USING (
    role = 'psychologist'
    AND EXISTS (
      SELECT 1 FROM psychologist_profiles
      WHERE id = profiles.id AND license_verified = true
    )
  );

-- Profiles: cada usuario edita su propio perfil
CREATE POLICY "own_profile_write" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Psychologist profiles: lectura pública solo si verificado
CREATE POLICY "public_read_verified" ON psychologist_profiles
  FOR SELECT USING (license_verified = true OR auth.uid() = id);

-- WhatsApp link: solo visible si hay solicitud aceptada
CREATE POLICY "whatsapp_on_accepted" ON psychologist_profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM appointment_requests
      WHERE psychologist_id = psychologist_profiles.id
      AND patient_id = auth.uid()
      AND status = 'accepted'
    )
    OR auth.uid() IN (SELECT user_id FROM admin_roles)
  );

-- Appointment requests: paciente ve las suyas
CREATE POLICY "patient_own_requests" ON appointment_requests
  FOR SELECT USING (auth.uid() = patient_id);

-- Appointment requests: psicólogo ve las dirigidas a él
CREATE POLICY "psychologist_own_requests" ON appointment_requests
  FOR SELECT USING (auth.uid() = psychologist_id);

-- Appointment requests: paciente puede insertar
CREATE POLICY "patient_insert_requests" ON appointment_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);
```

---

## 3. Arquitectura de páginas

### Rutas

| Ruta | Acceso | Propósito |
|------|--------|-----------|
| `/` | Público | Landing hero + CTA "Buscar psicólogo" |
| `/psicologos` | Público | Catálogo de psicólogos verificados |
| `/psicologo/[id]` | Público | Perfil detalle del psicólogo |
| `/login` | Público | Magic Link form |
| `/dashboard` | Auth | Contenido según role (patient/psychologist) |
| `/solicitar/[id]` | Auth (patient) | Formulario de solicitud |
| `/solicitud/[id]` | Auth | Estado de la solicitud |
| `/admin` | Admin | Verificación de psicólogos |

### Estructura de archivos

```
src/
  app/
    layout.tsx
    page.tsx                          → Landing
    (public)/
      psicologos/
        page.tsx
      psicologo/
        [id]/
          page.tsx
      login/
        page.tsx
    (auth)/
      layout.tsx
      dashboard/
        page.tsx
      solicitar/
        [id]/
          page.tsx
      solicitud/
        [id]/
          page.tsx
    admin/
      layout.tsx
      page.tsx
  features/
    auth/
      components/
        magic-link-form.tsx
      actions.ts
      schemas.ts
    catalog/
      components/
        psychologist-card.tsx
        psychologist-list.tsx
        specialty-filter.tsx
      queries.ts
      types.ts
    appointments/
      components/
        request-form.tsx
        request-status.tsx
      actions.ts
      schemas.ts
      types.ts
    dashboard/
      components/
        requests-list.tsx
        patient-dashboard.tsx
        psychologist-dashboard.tsx
      actions.ts
      queries.ts
      types.ts
    admin/
      components/
        pending-verification.tsx
        verification-detail.tsx
      actions.ts
      types.ts
  lib/
    supabase/
      client.ts
      server.ts
      admin.ts
    env.ts
    logger.ts
    rate-limit.ts
  types/
    database.ts          → Tipos generados de Supabase
```

---

## 4. Componentes críticos

### Regla de revalidación
Toda Server Action que modifique `is_available`, `license_verified` o cree/acepte/rechace una solicitud debe llamar a `revalidatePath()` sobre las rutas afectadas para que el catálogo y dashboards reflejen cambios instantáneamente:

| Acción | revalidatePath |
|--------|---------------|
| Toggle disponibilidad | `/psicologos` |
| Aceptar/Rechazar solicitud | `/dashboard` |
| Verificar psicólogo (admin) | `/psicologos`, `/admin` |

### Logging de soporte
Cada `appointment_requests` expone su `id` en la URL del dashboard (`/solicitud/[id]`). Si el formulario falla, el toast de error debe incluir el `requestId` (si se generó) o un mensaje como "Error al enviar. Intenta de nuevo." con botón de reintentar. Esto permite que el usuario reporte el error con un ID concreto y se pueda rastrear en logs de Supabase.

### Botón WhatsApp
El botón de contacto en el dashboard del paciente debe usar el color oficial `#25d366` (fondo verde, texto blanco, ícono Lucide `MessageCircle`) para que sea visualmente inconfundible como acción de salida de la plataforma.

### PsychologistCard (catalog)
| Estado | URI | Visual |
|--------|-----|--------|
| loading | | Skeleton: avatar circular + líneas de texto |
| available | `is_available=true` | Avatar, nombre, especialidades badges, indicador verde, botón activo |
| unavailable | `is_available=false` | Avatar, nombre, especialidades badges, indicador gris, botón "No disponible temporalmente" disabled |

### RequestForm (appointments)
| Estado | URI | Visual |
|--------|-----|--------|
| idle | | Formulario con checkboxes (reason), input edad, textarea horario, checkbox consentimiento |
| submitting | Server Action running | Botón loading, campos disabled |
| success | INSERT ok | "Tu solicitud ha sido enviada con éxito" + enlace a dashboard |
| error | INSERT fail / validación | Toast error + botón reintentar |

### DashboardRequestsList (dashboard)
| Role | Filtro | Acciones |
|------|--------|----------|
| patient | `patient_id = auth.uid()` | Ver estado (pending/accepted/rejected). Si accepted: botón WhatsApp |
| psychologist | `psychologist_id = auth.uid()` | Aceptar (→ email paciente) / Rechazar. Ver datos del paciente |

---

## 5. Flujo de conexión WhatsApp

```
Paciente                    Plataforma                  Psicólogo
   │                           │                           │
   ├─ Login (Magic Link) ─────→│                           │
   ├─ Busca psicólogo ────────→│                           │
   ├─ Solicita ayuda ─────────→│                           │
   │                           ├── INSERT appointment ────→│
   │                           │   + email notificación    │
   │                           │                           ├─ Acepta
   │                           │←── UPDATE status ────────┤
   │                           │   + email al paciente     │
   │←── WhatsApp link ────────┤                           │
   ├─ Click wa.me ────────────→│                           │
   │    (fuera de plataforma)  │                           │
```

### Notificaciones (Resend)

| Evento | Trigger | Destinatario | Contenido |
|--------|---------|-------------|-----------|
| Nueva solicitud | INSERT appointment_requests | Psicólogo | "Tienes una nueva solicitud de [nombre]. Motivo: [razón]. Revisa tu dashboard." |
| Solicitud aceptada | UPDATE status='accepted' | Paciente | "Tu solicitud fue aceptada. Ingresa a tu dashboard para contactar al psicólogo." |
| Recordatorio 24h | Cron Vercel (post-MVP) | Psicólogo | "Tienes solicitudes pendientes desde hace 24h. Si no puedes atender, declínalas." |

---

## 6. Seguridad

| Aspecto | Implementación |
|---------|---------------|
| RLS | Todas las tablas. WhatsApp link protegido por subquery a appointment_requests |
| CSP | Nonce por request en middleware |
| Rate limiting | In-memory Map (10 req/10s por IP) |
| Input validation | Zod en cada formulario, Server Action y API route |
| Env validation | Zod schema en `lib/env.ts` |
| WhatsApp links | Validación Zod: `z.string().url().regex(/^https:\/\/wa\.me\/\d+$/)` |
| Documentos | Storage privado, solo admin y owner |
| Magic Link | Supabase Auth sin contraseñas |

---

## 7. Design tokens (resumen)

Ver `DESIGN.md` para el detalle completo.

- **Primary:** `#2B7A6E` (verde salvia suave — calidez, crecimiento)
- **Background:** `#FDF8F3` (beige tierra) / `#F7F1EA` (fondo alterno)
- **Foreground:** `#2D3436` (negro suave)
- **Muted foreground:** `#8B7E72` / `#B0A89C`
- **Border:** `#E6DED4` (borde cálido)
- **WhatsApp:** `#25d366` (único color saturado)
- **Disponible:** `#4CAF50` / **No disponible:** `#B0A89C`
- **Radius:** 12-14px botones, 16px cards
- **Tipografía:** Geist Variable (única familia)
- **Tono verbal:** cálido, humano ("Conectar", "Conversar", "Espacio para hablar")
- **Mobile-first:** Todos los componentes responsivos desde 320px

---

## 8. Decisiones clave

| Decisión | Opción elegida | Alternativa descartada |
|----------|---------------|----------------------|
| Enfoque | Vertical Slice + Database-first (híbrido) | Modular puro (A) o solo vertical (B) |
| Auth | Magic Links | Google OAuth, email+password, o anónimo |
| WhatsApp link RLS | `EXISTS` subquery con `status='accepted'` | Campo público con verificación manual |
| Dashboard | Ruta única `/dashboard` con render por role | Rutas separadas `/dashboard-paciente` y `/dashboard-psicologo` |
| Notificaciones | Server Actions directas a Resend | Webhooks Supabase, triggers DB |
| Admin | Layout aislado en `/admin` | Integrado en dashboard con role check |
