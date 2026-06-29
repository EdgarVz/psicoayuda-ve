# Contributing

## Branch naming

- `feat/{desc}` — Nueva feature (ej: `feat/psychologist-list`)
- `fix/{desc}` — Bugfix (ej: `fix/auth-redirect`)
- `hotfix/{desc}` — Hotfix desde main
- `docs/{desc}` — Documentación
- `chore/{desc}` — Mantenimiento

## Conventional Commits

```
feat: add psychologist availability toggle
fix: validate consent before submission
docs: add ADR for WhatsApp flow
chore: update dependencies
```

## Flujo

1. Crear branch desde `develop`
2. Implementar con tests
3. `npm run lint && npx tsc --noEmit && npm run build && npm test`
4. PR a `develop`
5. Code review
6. Merge a `develop`
7. Release: PR `develop` → `main`
