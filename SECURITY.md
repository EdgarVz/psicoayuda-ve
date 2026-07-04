# Security

## Reporting vulnerabilities

Envía un email a [security@psicoayuda.com.ve] o abre un issue privado en GitHub.

## Políticas implementadas (OWASP L1)

- **CSP**: Content-Security-Policy con nonce por request en `proxy.ts`
- **Rate limiting**: Map en memoria (10 requests/10s)
- **Input validation**: Zod en cada formulario, API endpoint y webhook
- **Env validation**: Zod schema en `lib/env.ts` — REQUIRED lanza error, OPTIONAL fallback null
- **RLS**: Row Level Security en TODAS las tablas de Supabase
- **Auth**: Supabase Auth con Magic Links (sin contraseñas)
- **Headers**: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

## Admin

- Los administradores se gestionan en `admin_roles` (tabla separada)
- Nunca usar `service_role_key` en el cliente
- Dashboard y Admin Panel tienen layouts aislados con code splitting

## Storage

- `psychologist-documents`: privado (solo owner y admin)
- `avatars`: público
