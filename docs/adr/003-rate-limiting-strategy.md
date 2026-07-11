# ADR 003: Rate Limiting — In-Memory Map Acceptable for Vercel Hobby

**Fecha:** 2026-07-06
**Estatus:** Aprobado

## Contexto

La aplicación implementa rate limiting vía `lib/rate-limit.ts` usando un `Map` en memoria con ventana deslizante de 10 segundos y límite de 10 requests por IP. Esta estrategia funciona correctamente en Vercel Hobby tier porque ejecuta una sola instancia serverless. Sin embargo, si el proyecto escala a múltiples instancias (Vercel Pro o tráfico sostenido que active concurrencia), cada instancia tendría su propio `Map` en memoria, multiplicando efectivamente el límite real y anulando la protección.

## Decisión

Aceptar el rate limiter in-memory mientras se esté en Vercel Hobby tier (1 instancia serverless). Documentar el riesgo y los triggers de migración para que el reemplazo sea una decisión táctica, no una sorpresa.

### Triggers de migración

Migrar a una solución compartida (Redis/upstash) cuando se alcance **cualquiera** de los siguientes umbrales:

1. **Por instancias:** Más de 1 instancia serverless concurrente de forma sostenida (actualmente Hobby = 1 instancia)
2. **Por tráfico:** Más de 500 requests/min sostenidos durante más de 1 hora

## Consecuencias

- (+) Sin dependencias externas — zero config para deploy inicial
- (+) Latencia mínima — operación en memoria sin round-trip a red
- (+) Adecuado para la escala actual del proyecto
- (-) El límite se multiplica silenciosamente si Vercel escala a múltiples instancias
- (-) Sin persistencia entre deploys — el estado se pierde al reiniciar
- (-) Migración manual requerida cuando se alcance el trigger
