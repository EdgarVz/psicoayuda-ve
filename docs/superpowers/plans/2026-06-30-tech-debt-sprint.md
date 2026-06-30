# Tech Debt + Doc Alignment Sprint

> **For agentic workers:** Use superpowers:dispatching-parallel-agents (Wave 1) + TDD per block.

**Goal:** Resolve all 9 identified discrepancies and tech debt items across the PsicoAyuda VE codebase.

**Branch strategy:** Each block in its own Paseo worktree (`fix/tech-debt-<slug>`), squash merge to `develop`.

**Order:** Risk-descending. Wave 1 runs in parallel via subagents.

---

## ✅ Wave 1 — Completado

| Bloque | PR | Estado |
|--------|----|--------|
| B (navbar isLoggedIn) | [#8](https://github.com/EdgarVz/psicoayuda-ve/pull/8) | ✅ merged |
| E (Resend notifications) | [#9](https://github.com/EdgarVz/psicoayuda-ve/pull/9) | ✅ merged |
| G (middleware→proxy) | [#10](https://github.com/EdgarVz/psicoayuda-ve/pull/10) | ✅ merged |
| H (Playwright E2E) | [#11](https://github.com/EdgarVz/psicoayuda-ve/pull/11) | ✅ merged |

## ✅ Wave 2 — Completado

| Bloque | PR | Estado |
|--------|----|--------|
| A (CSS tokens) | [#12](https://github.com/EdgarVz/psicoayuda-ve/pull/12) | ✅ merged |
| C (type safety) | [#13](https://github.com/EdgarVz/psicoayuda-ve/pull/13) | ✅ merged |
| F (accesibilidad input) | [#14](https://github.com/EdgarVz/psicoayuda-ve/pull/14) | ✅ merged |

## ✅ Wave 3 — Completado

| Bloque | PR | Estado |
|--------|----|--------|
| D (doc fixes) | Commits directos a develop | ✅ |
| I (migration SQL) | [#15](https://github.com/EdgarVz/psicoayuda-ve/pull/15) | ✅ merged |

---

## Dependencies

```
Wave 1 (B, E, G, H) → fully parallel, no shared files
Wave 2 (A, C, F) → fully parallel, no shared files
Wave 3 (D, I) → fully parallel, no shared files
```

**No blocking dependencies between waves.** Each block is independent.

## Acceptance

- Build: `npm run build` PASS
- Lint: `npm run lint` PASS
- Typecheck: `npx tsc --noEmit` PASS
- Tests: `npm test` PASS (existing 83 tests + new TDD tests)
- E2E: `npx playwright test` PASS (Block H)
- Git: clean working tree, commits por bloque
