# Runbook

## Deploy

Automático via Vercel. Cada push a `main` y `develop` genera deploy automático.

## Monitoreo

- **Sentry**: Rendimiento + errores (condicional). Dashboard en sentry.io
- **Supabase**: Logs de consultas + auth en supabase.com
- **Vercel**: Logs de serverless functions en vercel.com

## Rollback

Vercel instant rollback desde el dashboard. Seleccionar deploy anterior y confirmar.

## Incidentes

1. Revisar Sentry para stack trace (si configurado)
2. Revisar Supabase logs si es error de DB
3. Revisar Vercel logs si es error de serverless
4. Si es crítico: rollback inmediato
