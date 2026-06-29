# ADR 002: Trunk-Based Development con Develop + Ramas Efímeras

**Fecha:** 2026-06-05
**Estatus:** Aprobado

## Contexto
El proyecto tiene entregas por fases (10 fases), múltiples features por fase, y necesita despliegues preview por feature para testing en dispositivos reales VE. Un Git Flow tradicional (develop → release → hotfix → main) genera merges innecesarios y conflictos que ralentizan un MVP.

## Decisión
Adoptar Trunk-Based Development adaptado con dos ramas protegidas y ramas efímeras:

```
main (producción, protegida)
  ▲ merge commit por fase
  └── develop (staging, protegida)
        ▲ squash merge por feature
        ├── feat/psychologist-catalog
        ├── feat/magic-link-auth
        ├── fix/dashboard-request-filter
        └── hotfix/auth-redirect   ← nace de main, merge a ambos flujos
```

Reglas:
- `main`: refleja producción. Solo PRs desde `develop` con merge commit.
- `develop`: staging. PRs desde `feat/*` o `fix/*` con squash merge.
- `feat/F*` o `fix/F*`: ramas cortas (≤3 días). Nacen de `develop`, se borran al mergear.
- `hotfix/F*`: nace de `main`, mergea a `main` + `develop`.
- Conventional Commits: `feat(F1):`, `fix(F6):`, `docs(F0):`, `chore:`.

## Consecuencias
- (+) Cada feature tiene su Preview Deployment en Vercel para validación en dispositivos VE.
- (+) develop como staging protegido evita mergear código sin aprobar a main.
- (+) Squash merge mantiene develop con historia lineal y limpia.
- (-) Dos ramas protegidas requieren más PRs que Trunk-Based puro.
- (-) Si develop se atrasa respecto a main, hay que sincronizar manualmente.
