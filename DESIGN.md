# PsicoAyuda VE — Design System

> Category: Health & Social Impact
> Plataforma de apoyo psicológico en crisis. Verde salvia, beige tierra, tipografía Geist. Calma, calidez, humanidad.

## 1. Visual Theme & Atmosphere

Plataforma de apoyo psicológico para Venezuela con identidad que transmite **contención, calidez y confianza humana**. La paleta abandona los azules institucionales (fríos, corporativos) por un verde salvia suave (`#2B7A6E`) como primary — conexión con la naturaleza, crecimiento, renovación — combinado con beige tierra como fondo (`#F7F1EA`, `#FDF8F3`) que evoca calidez orgánica.

El diseño es deliberadamente **suave**: esquinas redondeadas (12-14px), espaciado generoso, tipografía limpia. Cada pantalla prioriza la claridad emocional sobre la densidad de información. El único color saturado es el verde de WhatsApp (`#25d366`), funcionando como faro visual inconfundible para la acción de salida.

Optimizado para conexiones lentas y dispositivos de gama media. Sin elementos decorativos innecesarios.

**Características clave:**
- Modo claro únicamente (sin dark mode en F1)
- Verde salvia `#2B7A6E` como primary — botones, links, headers
- Beige tierra `#F7F1EA` / `#FDF8F3` como fondo — calidez, contención
- Marrón suave `#6B5E54` para texto secundario — menos contraste agresivo
- Geist (sans-serif) para toda la UI
- Fotografía de perfil como elemento humano central
- Badge de verificación sobre fondo verde suave `#E8F4F0`
- Botón WhatsApp `#25D366` como único elemento visual saturado
- Formularios con bordes suaves y esquinas generosas (12px+)
- Tono verbal acogedor ("Conectar", "Conversar", "Espacio para hablar")
- Layout mobile-first, consumo de datos reducido

## 2. Color Palette & Roles

### Brand
- **Primary** (`#2B7A6E` / hsl 168 46% 32%): Botones principales, links activos, headers
- **Primary-foreground** (`#fafafa` / hsl 0 0% 98%): Texto sobre primary
- **Primary hover** (`#1D6B5F`): Hover en botones primarios

### Primary Scale
| Token | Hex | HSL | Uso |
|-------|-----|-----|-----|
| 50 | `#E8F4F0` | 160 32% 93% | Fondos de secciones, badges de verificación |
| 100 | `#D4EDE6` | 162 28% 88% | Alertas informativas |
| 200 | `#A8D5C8` | 160 24% 75% | |
| 300 | `#7DBEAC` | 162 22% 62% | |
| 400 | `#52A690` | 162 28% 49% | Hover states suaves |
| 500 | `#3D8F7D` | 165 30% 40% | |
| 600 | `#2B7A6E` | 168 46% 32% | **Primary DEFAULT** |
| 700 | `#1D6B5F` | 168 56% 27% | Hover |
| 800 | `#155C51` | 168 60% 22% | Active/pressed |
| 900 | `#0E4D43` | 170 64% 18% | |

### Accent
No se usa accent saturado. El único color acento visual es el verde WhatsApp.
Los badges y highlights usan verde primary en versión clara (50-100).

### Neutral Scale (Surface)
| Token | Hex | HSL | Uso |
|-------|-----|-----|-----|
| background | `#FDF8F3` | 30 50% 97% | Fondo de página (beige cálido) |
| background-alt | `#F7F1EA` | 30 25% 94% | Fondos alternos, contenedores |
| foreground | `#2D3436` | 200 7% 19% | Texto principal (negro suave) |
| card | `#FFFFFF` | 0 0% 100% | Tarjetas, modales |
| card-foreground | `#2D3436` | | Texto en tarjetas |
| popover | `#FFFFFF` | | Dropdowns, sheets |
| secondary | `#FAF6F1` | 35 33% 96% | Botones secundarios |
| secondary-foreground | `#6B5E54` | 25 12% 37% | Texto sobre secondary |
| muted | `#F5F0EA` | 30 20% 94% | Fondos muted, chips |
| muted-foreground | `#B0A89C` | 30 10% 65% | Texto secundario suave |
| border | `#E6DED4` | 30 20% 86% | Bordes de componentes (cálidos) |
| input | `#E6DED4` | | Bordes de inputs |
| ring | `#2B7A6E` | 168 46% 32% | Focus rings |

### Semantic Colors
| Token | Hex | HSL | Uso |
|-------|-----|-----|-----|
| success | `#E8F4F0` | 160 32% 93% | Fondo badge verificado |
| success-text | `#2B7A6E` | 168 46% 32% | Texto verificado |
| warning | `#FDF6E3` | 42 50% 94% | Fondo badge pendiente |
| warning-text | `#8B6E00` | 45 100% 27% | Texto pendiente |
| danger | `#FDF0F0` | 0 50% 97% | Fondo badge rechazado |
| danger-text | `#C06060` | 0 42% 56% | Texto rechazado |
| WhatsApp | `#25d366` | — | Botón contacto WA |
| available | `#4CAF50` | 122 39% 50% | Indicador disponible |
| unavailable | `#B0A89C` | 30 10% 65% | Indicador no disponible |

### Shadows
- **sm**: `0 1px 3px 0 rgb(0 0 0 / 0.04)` — cards
- **md**: `0 4px 12px 0 rgb(0 0 0 / 0.06)` — dropdowns, sheets
- **lg**: `0 8px 24px 0 rgb(0 0 0 / 0.08)` — modals

## 3. Typography Rules

### Font Families
- **UI/Body**: `Geist Variable` — geométrica sans-serif. Cargada vía `next/font/local`.

### Font Files (self-hosted)
```
app/fonts/
└── Geist-Variable.woff2
```

### Hierarchy
| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Hero Title | 36px (2.25rem) | 700 | 1.2 |
| Section Title | 20px (1.25rem) | 600 | 1.25 |
| Card Title | 15px (0.938rem) | 600 | 1.3 |
| Body | 16px (1rem) | 400 | 1.6 |
| Body Small | 14px (0.875rem) | 400 | 1.5 |
| Button | 14px (0.875rem) | 500 | 1.25 |
| Caption | 12px (0.75rem) | 400 | 1.5 |

### Principles
- **Single font**: Geist para todo el sistema. Sin dual-font para mantener simplicidad y velocidad de carga.
- **Weight contrast**: Headings 600-700, body 400, botones 500.
- **Espaciado generoso**: line-height 1.5-1.6 para legibilidad y sensación de holgura.
- **Español venezolano**: Todo el UI en español, tono acogedor ("Conectar", "Conversar", "Espacio para hablar").
- **Accesibilidad**: Tamaño mínimo 14px. Alto contraste en textos informativos, suave en secundarios.

## 4. Component Stylings

### Buttons

**Primary (Default)**
- Background: `#2B7A6E`
- Text: `#fafafa`
- Padding: 10px 20px (sm), 14px 32px (default), 16px 36px (lg)
- Radius: 12px
- Hover: `#1D6B5F`
- Focus: ring `#2B7A6E` offset 2px

**Secondary**
- Background: `#FAF6F1`
- Text: `#6B5E54`
- Border: 1.5px solid `#E6DED4`
- Radius: 12px

**Outline / Ghost**
- Background: transparent
- Border: 1.5px solid `#E6DED4`
- Hover: `#FAF6F1`

**WhatsApp (único CTA saturado)**
- Background: `#25d366`
- Text: `#ffffff`
- Radius: 12-14px
- Icon: Lucide `MessageCircle` left-aligned
- Pulse animation: `box-shadow` 0→10px rgba(37,211,102,0.4) → 0, duración 3.5s (ritmo calmante)

**Rechazar**
- Background: white
- Border: 1.5px solid `#E6DED4`
- Text: `#6B5E54`
- Radius: 10px

### Cards (Psychologist Card)
- Background: `#FFFFFF`
- Border: 1px solid `#E6DED4`
- Radius: 16px
- Shadow: `sm`
- Padding: 20px
- Layout: vertical — avatar 56px centrado arriba, info debajo, botón al fondo
- Avatar fallback: emoji 👩‍⚕️ en vez de inicial del nombre
- Especialidades como chips en `#F5F0EA`, texto `#6B5E54`, border-radius 20px
- Estado de disponibilidad: indicador verde/gris con texto descriptivo
- Botón "Conectar con [nombre completo]" o "Vuelve pronto · Horario: Lun–Vie"

### Inputs
- Background: white
- Border: 1.5px solid `#E6DED4`
- Radius: 12px
- Focus: border-color `#2B7A6E`, sin ring
- Padding: 12px 14px

### Badges
- **Default**: `bg=F5F0EA`, `text=6B5E54`, `radius=20px`
- **Success (verificado)**: `bg=E8F4F0`, `text=1D6B5F` (peso 600 para contraste)
- **Pending**: `bg=FDF6E3`, `text=7A6200` (peso 600)
- **Rejected**: `bg=FDF0F0`, `text=A04040` (peso 600)
- Font: 12px, weight 600 (garantiza contraste WCAG AA sobre fondos suaves)

### Navigation Bar
- Background: white
- Border-bottom: 1px solid `#E6DED4`
- Position: `sticky top-0 z-30`
- Logo: `#2B7A6E` + `#D4A574` span

## 5. Layout Principles

### Breakpoints (Tailwind system)
| Alias | Min-width | Uso |
|-------|-----------|-----|
| sm | 640px | Tablets pequeñas |
| md | 768px | Tablets landscape |
| lg | 1024px | Desktop entrada |
| xl | 1280px | Desktop full |

### Spacing System
- Base: 4px (0.25rem)
- Section padding: py-16 (64px) arriba/abajo en desktop, py-8 (32px) en mobile
- Card gap: gap-4 (16px) en grids, gap-5 (20px) en desktop
- Border-radius general: 12-14px para botones y contenedores principales, 16px para cards

### Page Layouts

#### Home (`/`)
- Navbar estándar sin hero invasivo
- Hero con ilustración minimalista (🌿) + copy cálido
- Grid de psicólogos disponibles (1/2/3 cols responsive)
- Sin carga pesada — página estática con datos server-side

#### Catalog (`/psicologos`)
- Filters row con chips seleccionables
- Grid de tarjetas de psicólogos
- Cada tarjeta: avatar, nombre, especialidades, disponibilidad, botón "Conectar"
- Loading skeleton mientras carga

#### Psychologist Detail (`/psicologo/[id]`)
- Avatar grande + info + badge verificado
- Biografía en tono humano
- Especialidades como chips
- Notice box explicando el flujo (🌱 ¿Cómo funciona?)
- Botón grande "Solicitar contacto con [nombre]" en verde WhatsApp

#### Login (`/login`)
- Icono + copy sencillo
- Input email + botón "Enviar enlace mágico"
- Link a registro psicólogo

#### Request Form (`/solicitar/[id]`)
- Título "Cuéntanos un poco"
- Checkboxes de motivo con selección múltiple
- Input edad + textarea horario
- Consentimiento explícito en box beige
- Botón "Enviar solicitud"
- Estados: idle → submitting → success (🌱) / error

#### Dashboard (`/dashboard`)
- Header con título y CTA
- Tabs: Todas / Esperando / Aceptadas
- Lista de requests con status badges
- Si accepted: botón WhatsApp `#25d366` pulse
- Role-based: patient ve "Mis espacios", psychologist ve "Solicitudes recibidas" + Aceptar/Rechazar

#### Admin (`/admin`)
- Sidebar en piedra cálida `#3D3834` (único elemento con fondo oscuro en la app — evita grises fríos)
- Tabla de psicólogos pendientes
- Botones Verificar / Rechazar

## 6. Tonos verbales

La interfaz debe hablar como una persona, no como un sistema:

| Contexto | Frase |
|----------|-------|
| Hero | "Un espacio para hablar cuando más lo necesitas" |
| Botón CTA | "Encontrar un psicólogo" |
| Botón tarjeta disponible | "Conectar con [nombre]" |
| Botón tarjeta no disponible | "Vuelve pronto · Horario: Lun–Vie" |
| Título formulario | "Cuéntanos un poco" |
| Pregunta motivo | "¿Qué te gustaría hablar?" |
| Solicitud enviada | "Tu solicitud fue enviada — ya diste el paso más importante" |
| Dashboard paciente | "Mis espacios de conversación" |
| Badge pending | "Esperando respuesta" |
| Botón WhatsApp | "Conversar" / "Conversar con [nombre]" |
| Solicitud aceptada | "¡[Nombre] te espera!" |
| Notice box | "🌱 ¿Cómo funciona?" |

## 7. Do's and Don'ts

### Do
- Usar verde salvia `#2B7A6E` para acciones principales
- Fondos beige `#FDF8F3` / `#F7F1EA` para calidez visual
- Esquinas redondeadas (12-16px) en contenedores y botones
- WhatsApp `#25d366` como ÚNICO color saturado en la interfaz
- Mostrar badge de verificación en tono verde suave
- Indicar horario en botón de no disponible
- Usar lenguaje cálido y humano ("Conectar", "Conversar", "Espacio para hablar")
- Loading skeleton en cards y listas mientras carga
- Empty state con mensaje de apoyo

### Don't
- No usar azules oscuros ni colores fríos
- No saturar la interfaz con múltiples colores llamativos
- No almacenar conversaciones de WhatsApp
- No mostrar WhatsApp del psicólogo sin aprobación de cita
- No usar dark mode en F1
- No cargar scripts pesados innecesarios
- No usar `console.log` — usar `lib/logger.ts`
- No usar `any` — preferir `unknown` + type guard

## 8. Responsive Behavior

### Mobile First
Todas las páginas se diseñan mobile-first con progressive enhancement hacia desktop.

### Collapsing Strategy
- Navigation: full links → hamburger icon
- Psychologist grid: 3 cols → 2 → 1
- Section padding: 64px → 48px → 32px
- Buttons: inline → full-width stacked
- Dashboard sidebar: always visible (lg+) → hidden (<lg)

### Touch targets
- Botones mínimo 44px altura para área de impacto del pulgar
- Chips y badges mínimo 32px altura
- Espaciado entre elementos táctiles: mínimo 8px
