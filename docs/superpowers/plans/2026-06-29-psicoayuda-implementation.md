# PsicoAyuda VE — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.
>
> **Note:** Updated 2026-06-30: root layout uses `geist/font/sans` (not `localFont`) and `@/components/ui/sonner` (not `@/components/ui/toaster`).

**Goal:** Build PsicoAyuda VE, a psychological crisis support platform for Venezuela connecting patients with verified volunteer psychologists exclusively via WhatsApp.

**Architecture:** Next.js 16 App Router + Supabase (Auth + PostgreSQL + Storage + RLS) + Tailwind CSS 4 + shadcn/ui. Magic Links as sole auth. Warm palette (#2B7A6E primary, #FDF8F3 background). Feature-based architecture under `src/features/`. Database-first with full RLS.

**Tech Stack:** Next.js 16, TypeScript 5, Supabase (native client), Zod 4, Zustand 5, Tailwind CSS 4, shadcn/ui, Resend, Sentry (conditional)

---

## Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── (public)/
│   │   ├── layout.tsx                        → Navbar + Footer
│   │   ├── page.tsx                          → Hero + 6 psicólogos destacados
│   │   ├── psicologos/
│   │   │   ├── page.tsx                      → Catálogo completo con filtros
│   │   │   └── catalog-client.tsx            → Client wrapper
│   │   ├── psicologo/[id]/page.tsx           → Detalle del psicólogo
│   │   └── login/page.tsx                    → Magic Link form
│   ├── (auth)/
│   │   ├── layout.tsx                        → Auth check wrapper
│   │   ├── dashboard/page.tsx                → Dashboard role-based
│   │   ├── solicitar/[id]/page.tsx           → Formulario de solicitud
│   │   └── solicitud/[id]/page.tsx           → Estado de la solicitud
│   └── admin/
│       ├── layout.tsx                        → Sidebar admin (#3D3834)
│       └── page.tsx                          → Verificación de psicólogos
├── features/
│   ├── auth/
│   │   ├── components/magic-link-form.tsx
│   │   ├── actions.ts
│   │   └── schemas.ts
│   ├── catalog/
│   │   ├── components/
│   │   │   ├── psychologist-card.tsx
│   │   │   ├── psychologist-list.tsx
│   │   │   └── specialty-filter.tsx
│   │   ├── queries.ts
│   │   └── types.ts
│   ├── psychologist/
│   │   ├── components/psychologist-profile.tsx
│   │   └── queries.ts
│   ├── appointments/
│   │   ├── components/
│   │   │   ├── request-form.tsx
│   │   │   └── request-status.tsx
│   │   ├── actions.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── requests-list.tsx
│   │   │   ├── patient-dashboard.tsx
│   │   │   ├── psychologist-dashboard.tsx
│   │   │   └── stats-cards.tsx
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   └── admin/
│       ├── components/
│       │   ├── pending-verification.tsx
│       │   └── verification-detail.tsx
│       ├── actions.ts
│       └── types.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── resend.ts
│   ├── env.ts
│   ├── logger.ts
│   ├── rate-limit.ts
│   ├── specialties.ts
│   └── utils.ts
├── types/
│   └── database.ts
└── middleware.ts
```

---

### Phase 0: Setup

#### Task 0.1 — Create Supabase project (manual)

**Action:** User creates new Supabase project via dashboard.

- Go to https://supabase.com/dashboard/projects
- Click "New project"
- Name: `psicoayuda-ve`
- Database password: (generate strong password)
- Region: South America (são paulo) — closest to Venezuela
- Pricing plan: Free

After creation, user shares: project ref, URL, anon key, service_role_key.

---

#### Task 0.2 — Scaffold Next.js project

**Files:**
- Create: (entire project scaffold)

- [x] **Step 1: Create Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: project scaffolded with `src/`, `app/`, `tsconfig.json` etc.

- [x] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js zustand zod resend
npm install @sentry/nextjs @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init -d
npx shadcn@latest add button card input label checkbox select toast
```

Expected: all deps installed, shadcn initialized with default config.

- [x] **Step 3: Verify tsconfig alias**

Read `tsconfig.json` to confirm `"@/*": ["./src/*"]` exists.

- [x] **Step 4: Create opencode.json**

```json
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=<NEW_PROJECT_REF>"
    }
  }
}
```

Replace `<NEW_PROJECT_REF>` with the actual project ref from Task 0.1.

- [x] **Step 5: Create .env.local**

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
RESEND_API_KEY=<resend_api_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SENTRY_DSN=
```

---

#### Task 0.3 — Initialize git & create branches

- [x] **Step 1: Initialize git & first commit**

```bash
git init
git add .
git commit -m "chore: initial scaffold"
```

Expected: git initialized, first commit created.

- [x] **Step 2: Create GitHub repository**

Puede ser manual (https://github.com/new) o via CLI:

```bash
gh repo create psicoayuda-ve --public --push --source=.
```

Expected: repositorio remoto creado, commit pusheado a `main`.

- [x] **Step 3: Create develop branch**

```bash
git branch develop
git push -u origin develop
```

Expected: remote `origin` con ramas `main` y `develop`.

**Estrategia de ramas:** `main` → producción, `develop` → integración, `feat/*` → features, `fix/*` → fixes, `hotfix/*` → urgentes.

---

#### Task 0.4 — Link to Vercel

**Action:** Manual via Vercel dashboard.

✅ Completado.

1. ✅ Ir a https://vercel.com/new
2. ✅ Importar repositorio `psicoayuda-ve`
3. ✅ Framework preset: Next.js (detectado automático)
4. ✅ Environment variables: copiar todas de `.env.local`
5. ✅ Deploy — `main` queda vinculado como producción
6. ✅ Project Settings → Git: agregar `develop` como Preview Branch
7. ⬜ Copiar `NEXT_PUBLIC_SITE_URL` = URL de preview de develop

Expected: `main` deploya a producción, `develop` deploya a preview automático. Build pasa en ambos.

---

#### Task 0.5 — Generate database types

> ⚠️ **Nota:** Ejecutar solo después de aplicar migrations (Phase 2.1). Si la DB está vacía, los tipos generados serán vacíos.

**Files:**
- Create: `src/types/database.ts`

- [x] **Step 1: Run Supabase typegen**

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
```

Expected: `src/types/database.ts` created with table types.

---

### Phase 1: Foundation

#### Task 1.1 — lib/env.ts

**Files:**
- Create: `src/lib/env.ts`

- [x] **Step 1: Write env validation schema**

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
})
```

- [x] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS (env types inferred correctly)

---

#### Task 1.2 — Supabase clients

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [x] **Step 1: Write browser client**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

- [x] **Step 2: Write server client**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [x] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS

---

#### Task 1.3 — lib/supabase/admin.ts

**Files:**
- Create: `src/lib/supabase/admin.ts`

- [x] **Step 1: Write admin client**

```typescript
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export function createAdminSupabase() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

- [x] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS

---

#### Task 1.4 — lib/logger.ts + lib/rate-limit.ts

**Files:**
- Create: `src/lib/logger.ts`
- Create: `src/lib/rate-limit.ts`

- [x] **Step 1: Write logger**

```typescript
import { env } from '@/lib/env'

interface LogPayload {
  message: string
  data?: Record<string, unknown>
  error?: unknown
}

const isSentryEnabled = !!env.SENTRY_DSN

async function logToSentry(level: string, payload: LogPayload) {
  if (!isSentryEnabled) return
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureMessage(payload.message, { level: level as 'info' | 'warning' | 'error', extra: payload.data })
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    logToSentry('info', { message, data })
  },
  warn(message: string, data?: Record<string, unknown>) {
    logToSentry('warning', { message, data })
  },
  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    console.error(message, error, data)
    logToSentry('error', { message, data, error })
  },
}
```

- [x] **Step 2: Write rate-limiter**

```typescript
const store = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit(ip: string, limit = 10, windowMs = 10_000): Promise<{ success: boolean }> {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (entry.count >= limit) {
    return { success: false }
  }

  entry.count++
  return { success: true }
}

// Cleanup stale entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60_000)
```

- [x] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS

---

#### Task 1.5 — middleware.ts

**Files:**
- Create: `src/middleware.ts`

- [x] **Step 1: Write middleware**

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

const publicPaths = ['/', '/psicologos', '/psicologo/', '/login']

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSP nonce
  const nonce = crypto.randomUUID()
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://js.sentry-cdn.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co`,
    `font-src 'self'`,
    `connect-src 'self' https://*.supabase.co https://sentry.io https://o*.ingest.sentry.io`,
    `frame-ancestors 'none'`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Auth check
  const authCookie = request.cookies.get('auth_logged_in')
  const isLoggedIn = authCookie?.value === 'true'
  requestHeaders.set('x-user-authenticated', isLoggedIn ? 'true' : 'false')

  // Protect auth routes
  if (!isPublicPath(pathname) && !isLoggedIn) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/solicitar') || pathname.startsWith('/solicitud')) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect admin routes with real auth check
  if (pathname.startsWith('/admin')) {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

- [x] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS

---

#### Task 1.6 — Layouts + globals.css

**Files:**
- Create: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/admin/layout.tsx`

- [x] **Step 1: Write globals.css**

```css
@import "tailwindcss";

@theme {
  --color-primary: #2B7A6E;
  --color-primary-light: #3D9588;
  --color-primary-dark: #1E5F55;
  --color-background: #FDF8F3;
  --color-background-alt: #F7F1EA;
  --color-foreground: #2D3436;
  --color-muted: #8B7E72;
  --color-muted-light: #B0A89C;
  --color-border: #E6DED4;
  --color-whatsapp: #25d366;
  --color-available: #4CAF50;
  --color-unavailable: #B0A89C;
  --color-danger: #E74C3C;
  --color-warning: #F39C12;

  --radius-button: 12px;
  --radius-card: 16px;
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: 'Geist', system-ui, sans-serif;
  }
}
```

- [x] **Step 2: Write root layout**

```typescript
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: { template: '%s · PsicoAyuda VE', default: 'PsicoAyuda VE — Apoyo psicológico en Venezuela' },
  description: 'Conectamos pacientes con psicólogos voluntarios verificados en Venezuela. Apoyo emocional gratuito vía WhatsApp.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [x] **Step 3: Write error.tsx**

```typescript
'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Algo salió mal</h1>
      <p className="text-muted mb-6">Hubo un error inesperado. Por favor intenta de nuevo.</p>
      <button onClick={reset} className="bg-primary text-white px-6 py-3 rounded-radius-button hover:bg-primary-light transition-colors">
        Intentar de nuevo
      </button>
    </div>
  )
}
```

- [x] **Step 4: Write not-found.tsx**

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Página no encontrada</h1>
      <p className="text-muted mb-6">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="bg-primary text-white px-6 py-3 rounded-radius-button hover:bg-primary-light transition-colors">
        Volver al inicio
      </Link>
    </div>
  )
}
```

- [x] **Step 5: Write public layout**

```typescript
import { Navbar } from '@/features/layout/components/navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  )
}
```

- [x] **Step 6: Write auth layout**

```typescript
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  if (!isLoggedIn) {
    redirect('/login')
  }

  return <>{children}</>
}
```

- [x] **Step 7: Write admin layout**

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { template: '%s · Admin PsicoAyuda VE', default: 'Admin · PsicoAyuda VE' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#3D3834] text-white p-6 flex flex-col gap-6">
        <Link href="/admin" className="text-lg font-semibold">PsicoAyuda VE</Link>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="text-white/80 hover:text-white transition-colors">Verificaciones</Link>
          <Link href="/" className="text-white/80 hover:text-white transition-colors">Volver al sitio</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  )
}
```

- [x] **Step 8: Build check**

```bash
npm run build
```

Expected: PASS (may need to stub Navbar import — will be created in Task 1.7)

---

#### Task 1.7 — Navbar + layout components

**Files:**
- Create: `src/features/layout/components/navbar.tsx`
- Create: `src/features/layout/components/footer.tsx`

- [x] **Step 1: Write Navbar**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  isLoggedIn?: boolean
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary">
          PsicoAyuda VE
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/psicologos"
            className={`text-sm transition-colors ${pathname === '/psicologos' ? 'text-primary font-medium' : 'text-muted hover:text-foreground'}`}
          >
            Psicólogos
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-light transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-primary text-white px-4 py-2 rounded-radius-button hover:bg-primary-light transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [x] **Step 2: Write Footer**

```typescript
export function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted">
        <p>PsicoAyuda VE — Apoyo psicológico gratuito para Venezuela</p>
        <p className="mt-1">Esta plataforma es solo un medio de contacto. No almacenamos conversaciones.</p>
      </div>
    </footer>
  )
}
```

- [x] **Step 3: Update public layout to include Footer**

```typescript
import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  )
}
```

- [x] **Step 4: Build check**

```bash
npm run build
```

Expected: PASS

---

### Phase 2: Database + RLS

#### Task 2.1 — Migration: enums + tables

**Files:**
- Execute via Supabase MCP: `execute_sql`

- [x] **Step 1: Create enums**

```sql
CREATE TYPE user_role AS ENUM ('psychologist', 'patient');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE specialty AS ENUM (
  'duelo', 'ansiedad', 'crisis_panico', 'trauma',
  'apoyo_ninos', 'apoyo_adolescentes', 'depresion',
  'estres', 'violencia', 'adicciones'
);
```

- [x] **Step 2: Create profiles table**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Caracas',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

- [x] **Step 3: Create psychologist_profiles table**

```sql
CREATE TABLE psychologist_profiles (
  id UUID PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_document TEXT,
  license_verified BOOLEAN DEFAULT false,
  biography TEXT,
  specialties specialty[] DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['español'],
  whatsapp_link TEXT,
  availability JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE psychologist_profiles ENABLE ROW LEVEL SECURITY;
```

- [x] **Step 4: Create appointment_requests table**

```sql
CREATE TABLE appointment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  patient_age INT CHECK (patient_age >= 10 AND patient_age <= 120),
  reason specialty[] NOT NULL,
  preferred_schedule TEXT,
  status request_status DEFAULT 'pending',
  consent_granted BOOLEAN NOT NULL CHECK (consent_granted = true),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;
```

- [x] **Step 5: Create admin_roles table**

```sql
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
```

- [x] **Step 6: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Expected: 4 tables returned

---

#### Task 2.2 — Migration: RLS policies

- [x] **Step 1: Create all RLS policies**

```sql
-- Profiles: public read verified psychologists
CREATE POLICY "public_read_verified_psychologists" ON profiles
  FOR SELECT USING (
    role = 'psychologist'
    AND EXISTS (
      SELECT 1 FROM psychologist_profiles
      WHERE id = profiles.id AND license_verified = true
    )
  );

-- Profiles: own profile write
CREATE POLICY "own_profile_write" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Profiles: public can insert (self-registration trigger)
CREATE POLICY "own_profile_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Psychologist profiles: public read if verified
CREATE POLICY "public_read_verified" ON psychologist_profiles
  FOR SELECT USING (license_verified = true OR auth.uid() = id);

-- WhatsApp link: only visible on accepted request
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

-- Psychologist profiles: owner can update
CREATE POLICY "psychologist_own_update" ON psychologist_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Appointment requests: patient sees own
CREATE POLICY "patient_own_requests" ON appointment_requests
  FOR SELECT USING (auth.uid() = patient_id);

-- Appointment requests: psychologist sees theirs
CREATE POLICY "psychologist_own_requests" ON appointment_requests
  FOR SELECT USING (auth.uid() = psychologist_id);

-- Appointment requests: patient can insert
CREATE POLICY "patient_insert_requests" ON appointment_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Appointment requests: psychologist can update status
CREATE POLICY "psychologist_update_requests" ON appointment_requests
  FOR UPDATE USING (auth.uid() = psychologist_id);

-- Admin roles: admin can read own
CREATE POLICY "admin_read_own" ON admin_roles
  FOR SELECT USING (auth.uid() = user_id);
```

- [x] **Step 2: Verify RLS is enabled on all tables**

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'psychologist_profiles', 'appointment_requests', 'admin_roles');
```

Expected: all 4 tables have `rowsecurity = true`

---

#### Task 2.3 — Trigger: auto updated_at

- [x] **Step 1: Create trigger function and apply to tables**

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON psychologist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON appointment_requests
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

#### Task 2.4 — Trigger: auto profile on signup

- [x] **Step 1: Create trigger**

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    'patient',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

- [x] **Step 2: Verify trigger exists**

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Expected: trigger found

- [x] **Step 3: Regenerate types**

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
```

---

### Phase 3: Auth

#### Task 3.1 — Auth schemas

**Files:**
- Create: `src/features/auth/schemas.ts`

- [x] **Step 1: Write schemas**

- [x] **Step 2: Write test for schemas**

- [x] **Step 3: Run test**

Expected: PASS ✅ (5/5 tests passed)

---

#### Task 3.2 — Auth actions

**Files:**
- Create: `src/features/auth/actions.ts`

- [x] **Step 1: Write auth actions**
- [x] **Step 2: Write test for auth actions**

---

#### Task 3.3 — Magic link form + login page

**Files:**
- Create: `src/features/auth/components/magic-link-form.tsx`
- Create: `src/app/(public)/login/page.tsx`

- [x] **Step 1: Write MagicLinkForm component**
- [x] **Step 2: Write login page**
- [x] **Step 3: Build check**

Expected: PASS ✅

---

### Phase 4: Catalog

#### Task 4.1 — Catalog types + queries

**Files:**
- Create: `src/features/catalog/types.ts`
- Create: `src/features/catalog/queries.ts`

- [x] **Step 1: Write types**
- [x] **Step 2: Write queries**

---

#### Task 4.2 — Catalog components

**Files:**
- Create: `src/features/catalog/components/psychologist-card.tsx`
- Create: `src/features/catalog/components/psychologist-list.tsx`
- Create: `src/features/catalog/components/specialty-filter.tsx`

- [x] **Step 1: Write PsychologistCard**
- [x] **Step 2: Write PsychologistList**
- [x] **Step 3: Write SpecialtyFilter**

---

#### Task 4.3 — Home page

**Files:**
- Modify: `src/app/page.tsx`

- [x] **Step 1: Write home page**
- [x] **Step 2: Build check**

Expected: PASS ✅

---

#### Task 4.4 — Catalog page

**Files:**
- Create: `src/app/(public)/psicologos/page.tsx`

- [x] **Step 1: Write catalog page**
- [x] **Step 2: Write catalog client wrapper**
- [x] **Step 3: Build check**

Expected: PASS ✅

---

### Phase 5: Psychologist Detail

#### Task 5.1 — Psychologist queries

**Files:**
- Create: `src/features/psychologist/queries.ts`

- [x] **Step 1: Write queries**

```typescript
import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export interface PsychologistDetail {
  id: string
  displayName: string
  fullName: string
  avatarUrl: string | null
  biography: string | null
  specialties: string[]
  languages: string[]
  isAvailable: boolean
  availability: unknown
  licenseVerified: boolean
  licenseNumber: string
}

export async function getPsychologistById(id: string): Promise<PsychologistDetail> {
  const supabase = await createServerSupabase()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      psychologist_profiles (*)
    `)
    .eq('id', id)
    .eq('role', 'psychologist')
    .single()

  if (error || !profile?.psychologist_profiles) {
    notFound()
  }

  const prof = profile.psychologist_profiles as unknown as {
    full_name: string
    biography: string | null
    specialties: string[]
    languages: string[]
    is_available: boolean
    availability: unknown
    license_verified: boolean
    license_number: string
  }

  return {
    id: profile.id,
    displayName: profile.display_name,
    fullName: prof.full_name,
    avatarUrl: profile.avatar_url,
    biography: prof.biography,
    specialties: prof.specialties ?? [],
    languages: prof.languages ?? [],
    isAvailable: prof.is_available,
    availability: prof.availability,
    licenseVerified: prof.license_verified,
    licenseNumber: prof.license_number,
  }
}
```

---

#### Task 5.2 — Psychologist profile component

**Files:**
- Create: `src/features/psychologist/components/psychologist-profile.tsx`

- [x] **Step 1: Write component**

```typescript
import Image from 'next/image'
import Link from 'next/link'
import type { PsychologistDetail } from '@/features/psychologist/queries'

interface PsychologistProfileProps {
  psychologist: PsychologistDetail
}

export function PsychologistProfile({ psychologist }: PsychologistProfileProps) {
  const whatsappLink = psychologist.isAvailable
    ? `/solicitar/${psychologist.id}`
    : undefined

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-background-alt mx-auto md:mx-0">
          {psychologist.avatarUrl ? (
            <Image src={psychologist.avatarUrl} alt={psychologist.displayName} fill unoptimized className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted">
              {psychologist.displayName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <h1 className="text-2xl font-semibold">{psychologist.fullName}</h1>
            {psychologist.licenseVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verificado
              </span>
            )}
          </div>
          <p className="text-muted mt-1">{psychologist.displayName}</p>

          <div className="flex flex-wrap gap-1.5 mt-3 justify-center md:justify-start">
            {psychologist.specialties.map((s) => (
              <span key={s} className="text-sm bg-background-alt text-muted-foreground px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
            <span className={`w-2 h-2 rounded-full ${psychologist.isAvailable ? 'bg-available' : 'bg-unavailable'}`} />
            <span className="text-sm text-muted">
              {psychologist.isAvailable ? 'Disponible ahora' : 'No disponible temporalmente'}
            </span>
          </div>
        </div>
      </div>

      {psychologist.biography && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Sobre mí</h2>
          <p className="text-muted leading-relaxed">{psychologist.biography}</p>
        </div>
      )}

      <div className="mt-8 bg-background-alt rounded-radius-card p-6">
        <h3 className="font-medium mb-2">🌱 ¿Cómo funciona?</h3>
        <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
          <li>Solicitas contacto con el psicólogo</li>
          <li>El psicólogo recibe tu solicitud y la acepta</li>
          <li>Recibirás un enlace directo a WhatsApp</li>
          <li>Hablan directamente — la plataforma no almacena conversaciones</li>
        </ol>
      </div>

      {whatsappLink ? (
        <Link
          href={whatsappLink}
          className="mt-8 w-full block text-center bg-[#25d366] text-white py-4 rounded-radius-button font-medium text-lg hover:opacity-90 transition-opacity"
        >
          Solicitar contacto con {psychologist.displayName}
        </Link>
      ) : (
        <div className="mt-8 w-full block text-center bg-unavailable/20 text-muted py-4 rounded-radius-button font-medium">
          Vuelve pronto · Horario: próximamente
        </div>
      )}
    </div>
  )
}
```

---

#### Task 5.3 — Detail page

**Files:**
- Create: `src/app/(public)/psicologo/[id]/page.tsx`

- [x] **Step 1: Write page**

```typescript
import type { Metadata } from 'next'
import { getPsychologistById } from '@/features/psychologist/queries'
import { PsychologistProfile } from '@/features/psychologist/components/psychologist-profile'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const psychologist = await getPsychologistById(id)
  return {
    title: `${psychologist.fullName} — Psicólogo`,
    description: psychologist.biography?.slice(0, 160) ?? `Psicólogo especializado en ${psychologist.specialties.join(', ')}`,
  }
}

export default async function PsychologistPage({ params }: PageProps) {
  const { id } = await params
  const psychologist = await getPsychologistById(id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PsychologistProfile psychologist={psychologist} />
    </div>
  )
}
```

- [x] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS ✅

---

### Phase 6: Appointments

#### Task 6.1 — Appointment types + schemas

**Files:**
- Create: `src/features/appointments/types.ts`
- Create: `src/features/appointments/schemas.ts`

- [x] **Step 1: Write schemas**

```typescript
import { z } from 'zod'

const specialties = [
  'duelo', 'ansiedad', 'crisis_panico', 'trauma',
  'apoyo_ninos', 'apoyo_adolescentes', 'depresion',
  'estres', 'violencia', 'adicciones',
] as const

export const appointmentRequestSchema = z.object({
  psychologist_id: z.string().uuid('Psicólogo inválido'),
  patient_age: z
    .number({ required_error: 'Ingresa tu edad' })
    .min(10, 'La edad mínima es 10 años')
    .max(120, 'Edad inválida'),
  reason: z
    .array(z.enum(specialties))
    .min(1, 'Selecciona al menos un motivo'),
  preferred_schedule: z.string().optional(),
  consent_granted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos de consentimiento' }),
  }),
})

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>
```

- [x] **Step 2: Write types**

```typescript
import type { Database } from '@/types/database'

export type AppointmentRequest = Database['public']['Tables']['appointment_requests']['Row']
export type AppointmentRequestStatus = Database['public']['Tables']['appointment_requests']['Row']['status']
```

- [x] **Step 3: Schema tests**

```typescript
import { describe, it, expect } from 'vitest'
import { appointmentRequestSchema } from './schemas'

describe('appointmentRequestSchema', () => {
  const validData = {
    psychologist_id: '123e4567-e89b-12d3-a456-426614174000',
    patient_age: 30,
    reason: ['ansiedad'],
    consent_granted: true as const,
  }

  it('accepts valid data', () => {
    expect(appointmentRequestSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts valid data with preferred_schedule', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, preferred_schedule: 'Lunes por la tarde' }).success).toBe(true)
  })

  it('rejects age below 10', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, patient_age: 5 }).success).toBe(false)
  })

  it('rejects age above 120', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, patient_age: 150 }).success).toBe(false)
  })

  it('rejects empty reason', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, reason: [] }).success).toBe(false)
  })

  it('rejects consent_granted = false', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, consent_granted: false }).success).toBe(false)
  })

  it('rejects invalid specialty', () => {
    expect(appointmentRequestSchema.safeParse({ ...validData, reason: ['invalid_specialty'] }).success).toBe(false)
  })
})
```

- [x] **Step 4: Run tests**

```bash
npx vitest run src/features/appointments/schemas.test.ts
```

Expected: PASS

---

#### Task 6.2 — Appointment actions

**Files:**
- Create: `src/features/appointments/actions.ts`

- [x] **Step 1: Write actions**

```typescript
'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { appointmentRequestSchema, type AppointmentRequestInput } from './schemas'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function submitRequest(input: AppointmentRequestInput): Promise<{ data?: { id: string }; error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para enviar una solicitud' }

  const parsed = appointmentRequestSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { data, error } = await supabase
    .from('appointment_requests')
    .insert({
      psychologist_id: parsed.data.psychologist_id,
      patient_id: user.id,
      patient_age: parsed.data.patient_age,
      reason: parsed.data.reason,
      preferred_schedule: parsed.data.preferred_schedule ?? null,
      consent_granted: true,
    })
    .select('id')
    .single()

  if (error) {
    logger.error('submit_request failed', error, { psychologist_id: parsed.data.psychologist_id })
    return { error: 'Error al enviar la solicitud. Intenta de nuevo.' }
  }

  revalidatePath('/dashboard')
  return { data: { id: data.id } }
}

export async function acceptRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const { error } = await supabase
    .from('appointment_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('psychologist_id', user.id)

  if (error) {
    logger.error('accept_request failed', error, { requestId })
    return { error: 'Error al aceptar la solicitud' }
  }

  revalidatePath('/dashboard')
  return {}
}

export async function rejectRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const { error } = await supabase
    .from('appointment_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('psychologist_id', user.id)

  if (error) {
    logger.error('reject_request failed', error, { requestId })
    return { error: 'Error al rechazar la solicitud' }
  }

  revalidatePath('/dashboard')
  return {}
}
```

- [x] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS

---

#### Task 6.3 — Request form component

**Files:**
- Create: `src/features/appointments/components/request-form.tsx`

- [x] **Step 1: Write form**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitRequest } from '@/features/appointments/actions'

const REASONS = [
  { value: 'duelo', label: 'Duelo' },
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'crisis_panico', label: 'Crisis de pánico' },
  { value: 'trauma', label: 'Trauma' },
  { value: 'apoyo_ninos', label: 'Apoyo para niños' },
  { value: 'apoyo_adolescentes', label: 'Apoyo para adolescentes' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'estres', label: 'Estrés' },
  { value: 'violencia', label: 'Violencia' },
  { value: 'adicciones', label: 'Adicciones' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface RequestFormProps {
  psychologistId: string
  psychologistName: string
}

export function RequestForm({ psychologistId, psychologistName }: RequestFormProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [schedule, setSchedule] = useState('')
  const [consent, setConsent] = useState(false)

  function toggleReason(value: string) {
    setSelectedReasons((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('submitting')
    setError('')

    const result = await submitRequest({
      psychologist_id: psychologistId,
      patient_age: parseInt(patientAge, 10),
      reason: selectedReasons,
      preferred_schedule: schedule || undefined,
      consent_granted: true as const,
    })

    if (result.error) {
      setError(result.error)
      setState('error')
      return
    }

    setState('success')
    router.push(`/solicitud/${result.data!.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Edad</label>
        <input
          type="number"
          value={patientAge}
          onChange={(e) => setPatientAge(e.target.value)}
          min={10}
          max={120}
          required
          disabled={state === 'submitting'}
          placeholder="Tu edad"
          className="w-full px-4 py-3 rounded-radius-button border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">¿Con qué necesitas apoyo?</label>
        <p className="text-xs text-muted mb-3">Selecciona una o más opciones</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REASONS.map(({ value, label }) => (
            <label
              key={value}
              className={`flex items-center gap-2 p-3 rounded-radius-button border cursor-pointer transition-colors ${
                selectedReasons.includes(value)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border hover:border-primary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedReasons.includes(value)}
                onChange={() => toggleReason(value)}
                className="sr-only"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Preferencia de horario (opcional)</label>
        <textarea
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          disabled={state === 'submitting'}
          placeholder="Ej: Lunes en la tarde, miércoles por la mañana..."
          rows={3}
          className="w-full px-4 py-3 rounded-radius-button border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
        />
      </div>

      <div className="bg-background-alt rounded-radius-card p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            disabled={state === 'submitting'}
            className="mt-1"
          />
          <span className="text-sm text-muted">
            Acepto que esta plataforma es solo un medio de contacto.
            No se almacenarán conversaciones ni datos clínicos.
            Los psicólogos son voluntarios verificados pero la plataforma
            no se responsabiliza por la atención recibida.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm p-3 rounded-radius-button">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting' || !consent || selectedReasons.length === 0}
        className="w-full bg-[#25d366] text-white py-4 rounded-radius-button font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'submitting' ? 'Enviando solicitud...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
```

---

#### Task 6.4 — Request form page

**Files:**
- Create: `src/app/(auth)/solicitar/[id]/page.tsx`

- [x] **Step 1: Write page**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { RequestForm } from '@/features/appointments/components/request-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', id)
    .single()

  return {
    title: `Solicitar contacto con ${data?.display_name ?? 'psicólogo'} — PsicoAyuda VE`,
  }
}

export default async function SolicitarPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      display_name,
      psychologist_profiles!inner (
        is_available,
        license_verified
      )
    `)
    .eq('id', id)
    .eq('role', 'psychologist')
    .single()

  if (!profile) notFound()

  const psy = profile.psychologist_profiles as unknown as { is_available: boolean; license_verified: boolean }

  if (!psy.license_verified || !psy.is_available) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-2">Cuéntanos un poco</h1>
      <p className="text-muted text-center mb-8">
        Solicitud para {profile.display_name}
      </p>

      <RequestForm psychologistId={id} psychologistName={profile.display_name} />
    </div>
  )
}
```

---

#### Task 6.5 — Request status page

**Files:**
- Create: `src/features/appointments/components/request-status.tsx`
- Create: `src/app/(auth)/solicitud/[id]/page.tsx`

- [x] **Step 1: Write status component**

```typescript
'use client'

import Link from 'next/link'
import type { AppointmentRequestStatus } from '@/features/appointments/types'

interface RequestStatusProps {
  status: AppointmentRequestStatus
  whatsappLink?: string | null
  psychologistName: string
}

export function RequestStatusView({ status, whatsappLink, psychologistName }: RequestStatusProps) {
  if (status === 'pending') {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏳</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Solicitud enviada</h2>
        <p className="text-muted">
          Tu solicitud ha sido enviada a {psychologistName}.
          Recibirás una notificación cuando sea aceptada.
        </p>
      </div>
    )
  }

  if (status === 'accepted' && whatsappLink) {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Solicitud aceptada</h2>
        <p className="text-muted mb-6">
          {psychologistName} ha aceptado tu solicitud. Haz clic para contactar vía WhatsApp.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25d366] text-white px-8 py-4 rounded-radius-button font-medium text-lg hover:opacity-90 transition-opacity animate-pulse"
          style={{ animationDuration: '3.5s' }}
        >
          <span>Contactar por WhatsApp</span>
        </a>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <div className="w-16 h-16 bg-unavailable/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Solicitud no aceptada</h2>
        <p className="text-muted mb-6">
          {psychologistName} no pudo aceptar tu solicitud en este momento.
          Te invitamos a buscar otro psicólogo disponible.
        </p>
        <Link
          href="/psicologos"
          className="inline-block bg-primary text-white px-6 py-3 rounded-radius-button font-medium hover:bg-primary-light transition-colors"
        >
          Buscar otro psicólogo
        </Link>
      </div>
    )
  }

  return null
}
```

- [x] **Step 2: Write status page**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { RequestStatusView } from '@/features/appointments/components/request-status'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SolicitudPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: request, error } = await supabase
    .from('appointment_requests')
    .select(`
      status,
      psychologist_id,
      psychologist_profiles!inner (
        whatsapp_link,
        profiles!inner (
          display_name
        )
      )
    `)
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (error || !request) notFound()

  const psy = request.psychologist_profiles as unknown as {
    whatsapp_link: string | null
    profiles: { display_name: string }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <RequestStatusView
        status={request.status}
        whatsappLink={request.status === 'accepted' ? psy.whatsapp_link : null}
        psychologistName={psy.profiles.display_name}
      />
    </div>
  )
}
```

- [x] **Step 3: Build check**

```bash
npm run build
```

Expected: PASS ✅

---

### Phase 7: Dashboard

#### Task 7.1 — Dashboard queries + types

**Files:**
- Create: `src/features/dashboard/types.ts`
- Create: `src/features/dashboard/queries.ts`

- [ ] **Step 1: Write types**

```typescript
import type { Database } from '@/types/database'
import type { AppointmentRequestStatus } from '@/features/appointments/types'

export interface PatientRequestView {
  id: string
  psychologistName: string
  psychologistId: string
  status: AppointmentRequestStatus
  reason: string[]
  createdAt: string
  whatsappLink: string | null
}

export interface PsychologistRequestView {
  id: string
  patientName: string
  patientAge: number
  reason: string[]
  status: AppointmentRequestStatus
  createdAt: string
}

export interface DashboardStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}
```

- [ ] **Step 2: Write queries**

```typescript
import { createServerSupabase } from '@/lib/supabase/server'
import type { PatientRequestView, PsychologistRequestView, DashboardStats } from './types'

export async function getPatientRequests(userId: string): Promise<PatientRequestView[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      reason,
      created_at,
      psychologist_id,
      psychologist_profiles!inner (
        whatsapp_link,
        profiles!inner (
          display_name
        )
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => {
    const psy = row.psychologist_profiles as unknown as {
      whatsapp_link: string | null
      profiles: { display_name: string }
    }
    return {
      id: row.id,
      psychologistName: psy.profiles.display_name,
      psychologistId: row.psychologist_id,
      status: row.status,
      reason: row.reason,
      createdAt: row.created_at,
      whatsappLink: row.status === 'accepted' ? psy.whatsapp_link : null,
    }
  })
}

export async function getPsychologistRequests(userId: string): Promise<PsychologistRequestView[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('appointment_requests')
    .select(`
      id,
      status,
      reason,
      patient_age,
      created_at,
      profiles!inner (
        display_name
      )
    `)
    .eq('psychologist_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    patientName: (row.profiles as unknown as { display_name: string }).display_name,
    patientAge: row.patient_age,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }))
}

export async function getPatientStats(userId: string): Promise<DashboardStats> {
  const requests = await getPatientRequests(userId)
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}

export async function getPsychologistStats(userId: string): Promise<DashboardStats> {
  const requests = await getPsychologistRequests(userId)
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}
```

---

#### Task 7.2 — Dashboard components

**Files:**
- Create: `src/features/dashboard/components/patient-dashboard.tsx`
- Create: `src/features/dashboard/components/psychologist-dashboard.tsx`
- Create: `src/features/dashboard/components/requests-list.tsx`
- Create: `src/features/dashboard/components/stats-cards.tsx`

- [ ] **Step 1: Write StatsCards**

```typescript
import type { DashboardStats } from '@/features/dashboard/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
    { label: 'Pendientes', value: stats.pending, color: 'bg-warning/10 text-warning' },
    { label: 'Aceptadas', value: stats.accepted, color: 'bg-green-100 text-green-700' },
    { label: 'Rechazadas', value: stats.rejected, color: 'bg-red-50 text-danger' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, color }) => (
        <div key={label} className={`${color} rounded-radius-card p-4 text-center`}>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write RequestsList (shared between patient/psychologist views)**

```typescript
'use client'

import { useState } from 'react'
import { acceptRequest, rejectRequest } from '@/features/appointments/actions'

interface BaseRequest {
  id: string
  status: string
  reason: string[]
  createdAt: string
}

interface PatientRequest extends BaseRequest {
  psychologistName: string
  whatsappLink: string | null
  psychologistId: string
}

interface PsychologistRequest extends BaseRequest {
  patientName: string
  patientAge: number
}

interface RequestsListProps {
  requests: PatientRequest[] | PsychologistRequest[]
  role: 'patient' | 'psychologist'
}

export function RequestsList({ requests, role }: RequestsListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all')

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  const tabs = [
    { key: 'all' as const, label: 'Todas' },
    { key: 'pending' as const, label: 'Esperando' },
    { key: 'accepted' as const, label: 'Aceptadas' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm rounded-radius-button transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white border border-border rounded-radius-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                req.status === 'pending' ? 'bg-warning/10 text-warning' :
                req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                'bg-red-50 text-danger'
              }`}>
                {req.status === 'pending' ? 'Pendiente' :
                 req.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
              </span>
              <span className="text-xs text-muted">
                {new Date(req.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>

            {'patientName' in req ? (
              <div>
                <p className="font-medium">{req.patientName} · {req.patientAge} años</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {req.reason.map((r) => (
                    <span key={r} className="text-xs bg-background-alt text-muted-foreground px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="text-sm bg-available text-white px-4 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="text-sm bg-danger text-white px-4 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
                {req.status === 'accepted' && 'whatsappLink' in req && (req as PatientRequest).whatsappLink && (
                  <a
                    href={(req as PatientRequest).whatsappLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 bg-[#25d366] text-white px-4 py-2 rounded-radius-button text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium">{(req as PsychologistRequest).psychologistName}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {req.reason.map((r) => (
                    <span key={r} className="text-xs bg-background-alt text-muted-foreground px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
                {req.status === 'accepted' && 'whatsappLink' in req && (req as PatientRequest).whatsappLink && (
                  <a
                    href={(req as PatientRequest).whatsappLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 bg-[#25d366] text-white px-4 py-2 rounded-radius-button text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">No hay solicitudes en esta categoría</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write PatientDashboard**

```typescript
import type { PatientRequestView, DashboardStats } from '@/features/dashboard/types'
import { StatsCards } from './stats-cards'
import { RequestsList } from './requests-list'

interface PatientDashboardProps {
  requests: PatientRequestView[]
  stats: DashboardStats
}

export function PatientDashboard({ requests, stats }: PatientDashboardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Mis espacios</h2>
      <p className="text-muted text-sm mb-6">Seguimiento de tus solicitudes de ayuda</p>

      <StatsCards stats={stats} />
      <RequestsList requests={requests} role="patient" />
    </div>
  )
}
```

- [ ] **Step 4: Write PsychologistDashboard**

```typescript
import type { PsychologistRequestView, DashboardStats } from '@/features/dashboard/types'
import { StatsCards } from './stats-cards'
import { RequestsList } from './requests-list'

interface PsychologistDashboardProps {
  requests: PsychologistRequestView[]
  stats: DashboardStats
}

export function PsychologistDashboard({ requests, stats }: PsychologistDashboardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Solicitudes recibidas</h2>
      <p className="text-muted text-sm mb-6">Gestiona las solicitudes de ayuda de los pacientes</p>

      <StatsCards stats={stats} />
      <RequestsList requests={requests} role="psychologist" />
    </div>
  )
}
```

---

#### Task 7.3 — Dashboard page

**Files:**
- Create: `src/app/(auth)/dashboard/page.tsx`

- [ ] **Step 1: Write dashboard page**

```typescript
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getPatientRequests, getPsychologistRequests, getPatientStats, getPsychologistStats } from '@/features/dashboard/queries'
import { PatientDashboard } from '@/features/dashboard/components/patient-dashboard'
import { PsychologistDashboard } from '@/features/dashboard/components/psychologist-dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tus solicitudes de ayuda psicológica',
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role === 'patient') {
    const [requests, stats] = await Promise.all([
      getPatientRequests(user.id),
      getPatientStats(user.id),
    ])

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PatientDashboard requests={requests} stats={stats} />
      </div>
    )
  }

  if (profile.role === 'psychologist') {
    const [requests, stats] = await Promise.all([
      getPsychologistRequests(user.id),
      getPsychologistStats(user.id),
    ])

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PsychologistDashboard requests={requests} stats={stats} />
      </div>
    )
  }

  redirect('/')
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS

---

### Phase 8: Admin

#### Task 8.1 — Admin actions

**Files:**
- Create: `src/features/admin/types.ts`
- Create: `src/features/admin/actions.ts`

- [ ] **Step 1: Write types**

```typescript
export interface PendingPsychologist {
  id: string
  displayName: string
  fullName: string
  licenseNumber: string
  licenseDocument: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface VerificationAction {
  profileId: string
  approved: boolean
  reason?: string
}
```

- [ ] **Step 2: Write admin actions**

```typescript
'use server'

import { createAdminSupabase } from '@/lib/supabase/admin'
import { createServerSupabase } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function verifyPsychologist(profileId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: true })
    .eq('id', profileId)

  if (error) {
    logger.error('verify_psychologist failed', error, { profileId })
    return { error: 'Error al verificar psicólogo' }
  }

  revalidatePath('/admin')
  revalidatePath('/psicologos')
  return {}
}

export async function rejectPsychologist(profileId: string, reason?: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const admin = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single()
  if (!admin.data) return { error: 'No autorizado' }

  const adminSupabase = createAdminSupabase()
  const { error } = await adminSupabase
    .from('psychologist_profiles')
    .update({ license_verified: false })
    .eq('id', profileId)

  if (error) {
    logger.error('reject_psychologist failed', error, { profileId })
    return { error: 'Error al rechazar psicólogo' }
  }

  revalidatePath('/admin')
  return {}
}

export async function getPendingPsychologists(): Promise<PendingPsychologist[]> {
  const adminSupabase = createAdminSupabase()

  const { data } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      created_at,
      psychologist_profiles!inner (
        full_name,
        license_number,
        license_document
      )
    `)
    .eq('role', 'psychologist')
    .eq('psychologist_profiles.license_verified', false)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    ...(row.psychologist_profiles as unknown as { full_name: string; license_number: string; license_document: string | null }),
  }))
}
```

---

#### Task 8.2 — Admin components

**Files:**
- Create: `src/features/admin/components/pending-verification.tsx`
- Create: `src/features/admin/components/verification-detail.tsx`

- [ ] **Step 1: Write PendingVerification**

```typescript
'use client'

import { useState } from 'react'
import { verifyPsychologist, rejectPsychologist } from '@/features/admin/actions'
import type { PendingPsychologist } from '@/features/admin/types'

interface PendingVerificationProps {
  psychologists: PendingPsychologist[]
}

export function PendingVerification({ psychologists }: PendingVerificationProps) {
  const [selected, setSelected] = useState<PendingPsychologist | null>(null)

  async function handleVerify(id: string) {
    const result = await verifyPsychologist(id)
    if (result.error) alert(result.error)
  }

  async function handleReject(id: string) {
    const reason = prompt('Motivo de rechazo (opcional):')
    const result = await rejectPsychologist(id, reason ?? undefined)
    if (result.error) alert(result.error)
  }

  if (psychologists.length === 0) {
    return (
      <p className="text-muted text-center py-8">No hay psicólogos pendientes de verificación</p>
    )
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted">
            <th className="pb-3 font-medium">Psicólogo</th>
            <th className="pb-3 font-medium">Colegiatura</th>
            <th className="pb-3 font-medium">Documento</th>
            <th className="pb-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {psychologists.map((psy) => (
            <tr key={psy.id} className="border-b border-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background-alt flex items-center justify-center text-sm font-medium text-muted">
                    {psy.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{psy.fullName}</p>
                    <p className="text-sm text-muted">{psy.displayName}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-sm">{psy.licenseNumber}</td>
              <td className="py-3">
                {psy.licenseDocument ? (
                  <button
                    onClick={() => setSelected(psy)}
                    className="text-primary text-sm hover:underline"
                  >
                    Ver documento
                  </button>
                ) : (
                  <span className="text-sm text-muted">Sin documento</span>
                )}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(psy.id)}
                    className="text-sm bg-available text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => handleReject(psy.id)}
                    className="text-sm bg-danger text-white px-3 py-1.5 rounded-radius-button hover:opacity-90 transition-opacity"
                  >
                    Rechazar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <VerificationDetail
          psychologist={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write VerificationDetail**

```typescript
import type { PendingPsychologist } from '@/features/admin/types'

interface VerificationDetailProps {
  psychologist: PendingPsychologist
  onClose: () => void
  onVerify: (id: string) => void
  onReject: (id: string) => void
}

export function VerificationDetail({ psychologist, onClose, onVerify, onReject }: VerificationDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-radius-card max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{psychologist.fullName}</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted">Nombre de usuario:</span>
            <p>{psychologist.displayName}</p>
          </div>
          <div>
            <span className="text-muted">Número de colegiatura:</span>
            <p>{psychologist.licenseNumber}</p>
          </div>
          {psychologist.licenseDocument && (
            <div>
              <span className="text-muted">Documento:</span>
              <a
                href={psychologist.licenseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline mt-1"
              >
                Abrir documento
              </a>
            </div>
          )}
          <div>
            <span className="text-muted">Registrado el:</span>
            <p>{new Date(psychologist.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onVerify(psychologist.id); onClose() }}
            className="flex-1 bg-available text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Verificar
          </button>
          <button
            onClick={() => { onReject(psychologist.id); onClose() }}
            className="flex-1 bg-danger text-white py-2 rounded-radius-button font-medium hover:opacity-90 transition-opacity"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

#### Task 8.3 — Admin page

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Write admin page**

```typescript
import type { Metadata } from 'next'
import { getPendingPsychologists } from '@/features/admin/actions'
import { PendingVerification } from '@/features/admin/components/pending-verification'

export const metadata: Metadata = {
  title: 'Verificaciones pendientes',
}

export default async function AdminPage() {
  const pending = await getPendingPsychologists()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Verificaciones pendientes</h1>
      <PendingVerification psychologists={pending} />
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS

---

### Phase 9: Integration — Resend

#### Task 9.1 — Resend client + email templates

**Files:**
- Create: `src/lib/resend.ts`
- Modify: `src/features/appointments/actions.ts`

- [ ] **Step 1: Write Resend client**

```typescript
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const RESEND_FROM = 'onboarding@resend.dev'

function getResend() {
  if (!env.RESEND_API_KEY) {
    return null
  }
  // Dynamic import to avoid breaking when RESEND_API_KEY is missing
  const { Resend } = require('resend')
  return new Resend(env.RESEND_API_KEY)
}

export async function sendNewRequestEmail(psychologistEmail: string, patientName: string, reason: string[]): Promise<void> {
  const resend = getResend()
  if (!resend) {
    logger.warn('Resend not configured — skipping email notification')
    return
  }

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to: psychologistEmail,
    subject: 'Nueva solicitud de ayuda — PsicoAyuda VE',
    html: `
      <h2>Tienes una nueva solicitud</h2>
      <p><strong>De:</strong> ${patientName}</p>
      <p><strong>Motivo:</strong> ${reason.join(', ')}</p>
      <p>Revisa tu dashboard para aceptar o rechazar la solicitud.</p>
    `,
  })

  if (error) logger.error('Failed to send new request email', error)
}

export async function sendAcceptedEmail(patientEmail: string, psychologistName: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    logger.warn('Resend not configured — skipping email notification')
    return
  }

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to: patientEmail,
    subject: 'Tu solicitud fue aceptada — PsicoAyuda VE',
    html: `
      <h2>Tu solicitud fue aceptada</h2>
      <p><strong>Psicólogo:</strong> ${psychologistName}</p>
      <p>Ingresa a tu dashboard para contactar al psicólogo vía WhatsApp.</p>
    `,
  })

  if (error) logger.error('Failed to send accepted email', error)
}

export async function sendRejectedEmail(patientEmail: string, psychologistName: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    logger.warn('Resend not configured — skipping email notification')
    return
  }

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to: patientEmail,
    subject: 'Actualización de solicitud — PsicoAyuda VE',
    html: `
      <h2>Actualización de tu solicitud</h2>
      <p>Lamentamos informarte que ${psychologistName} no pudo aceptar tu solicitud.</p>
      <p>Te invitamos a buscar otro psicólogo disponible en nuestro catálogo.</p>
    `,
  })

  if (error) logger.error('Failed to send rejected email', error)
}
```

- [ ] **Step 2: Integrate Resend into appointment actions**

```typescript
// In src/features/appointments/actions.ts, add to submitRequest
import { createAdminSupabase } from '@/lib/supabase/admin'
import { sendNewRequestEmail, sendAcceptedEmail, sendRejectedEmail } from '@/lib/resend'

// In submitRequest, after successful insert:
// Get psychologist email
const adminSupabase = createAdminSupabase()
const { data: psyProfile } = await adminSupabase
  .from('profiles')
  .select('id')
  .eq('id', parsed.data.psychologist_id)
  .single()

if (psyProfile) {
  const { data: authUser } = await adminSupabase.auth.admin.getUserById(parsed.data.psychologist_id)
  if (authUser?.user?.email) {
    await sendNewRequestEmail(authUser.user.email, 'Un paciente', parsed.data.reason)
  }
}

// In acceptRequest, after successful update:
const { data: reqData } = await supabase
  .from('appointment_requests')
  .select('patient_id, psychologist_profiles!inner(profiles!inner(display_name))')
  .eq('id', requestId)
  .single()

if (reqData) {
  const psy = reqData.psychologist_profiles as unknown as { profiles: { display_name: string } }
  const { data: patientAuth } = await adminSupabase.auth.admin.getUserById(reqData.patient_id)
  if (patientAuth?.user?.email) {
    await sendAcceptedEmail(patientAuth.user.email, psy.profiles.display_name)
  }
}
```

---

### Phase 10: Tests + DoD

#### Task 10.1 — Test configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Create Vitest config**

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

- [ ] **Step 2: Add test script to package.json**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: ALL PASS

---

#### Task 10.2 — Final DoD

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors (no `ignoreBuildErrors: true`)

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All tests pass
```

---

## Checklist post-plan

**1. Spec coverage:**
- ✅ Stack (Next.js 16, Supabase, Zod, Zustand, Tailwind 4, shadcn/ui) — Task 0.2
- ✅ Data model (enums, 4 tables, RLS) — Tasks 2.1–2.4
- ✅ RLS policies (whatsapp_on_accepted, all policies) — Task 2.2
- ✅ Page architecture (all routes) — Tasks 3.3, 4.3–4.4, 5.3, 6.4–6.5, 7.3, 8.3
- ✅ Auth (Magic Links only, no passwords) — Tasks 3.1–3.3
- ✅ Component critical states (loading, available, unavailable, idle, submitting, success, error) — Tasks 4.2, 6.3, 6.5
- ✅ WhatsApp button #25d366 + pulse — Task 6.5
- ✅ Resend notifications (fallback) — Task 9.1
- ✅ CSP nonce — Task 1.5
- ✅ Rate limiting — Task 1.4
- ✅ Admin sidebar #3D3834 — Task 1.6
- ✅ Global warm palette — Task 1.6

**2. Placeholder scan:** None found.

**3. Type consistency:** All types flow consistently between features and are inferred from `database.ts` where possible.
