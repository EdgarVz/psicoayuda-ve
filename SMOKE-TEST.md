# Smoke Test

## Pre-lanzamiento

| # | Ítem | Cobertura |
|---|------|-----------|
| 1 | Registro de psicólogo crea profile en DB | 🔵 Unit test (actions) + ⬜ E2E |
| 2 | Magic Link login: recibe email, hace clic, redirigido a dashboard | 🔵 Unit test (actions) + ⬜ E2E |
| 3 | Catálogo de psicólogos carga correctamente | ✅ E2E (`e2e/smoke.spec.ts`) |
| 4 | Filtro por especialidad devuelve resultados | ⬜ Sin cobertura |
| 5 | Solicitud de contacto crea appointment_request | 🔵 Unit test (schemas + actions) |
| 6 | Psicólogo puede ver solicitudes en dashboard | 🔵 Unit test (queries + components) |
| 7 | Psicólogo puede aceptar/rechazar solicitud | 🔵 Unit test (actions) |
| 8 | WhatsApp link se muestra solo tras aprobación | 🔵 Unit test |
| 9 | Perfil de psicólogo editable desde dashboard | 🔵 Unit test |
| 10 | Admin puede verificar psicólogos | 🔵 Unit test (actions + components) |
| 11 | CSP headers presentes en response | ⬜ Sin cobertura |
| 12 | Rate limiting bloquea después de N requests | 🔵 Unit test |
| 13 | Sentry captura error intencional (si configurado) | 🔵 Unit test (logger) |

**Leyenda:** ✅ E2E automatizado · 🔵 Unit test · ⬜ Pendiente

## Cómo ejecutar

```bash
# Tests unitarios
npm test

# Tests E2E (requiere servidor en ejecución o automático via webServer)
npx playwright test

# Tests E2E con UI
npx playwright test --ui
```
