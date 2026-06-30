# Admin Panel — Design Spec

> **Phase 8** of PsicoAyuda VE implementation.

## Goal

Admin panel for verifying psychologist profiles (review license documents, approve/reject).

## Files

### `src/features/admin/types.ts`

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
```

### `src/features/admin/actions.ts`

3 server actions:

- `verifyPsychologist(profileId)` — sets `license_verified = true` via `createAdminSupabase()`. Checks admin role before proceeding.
- `rejectPsychologist(profileId)` — sets `license_verified = false`. Checks admin role.
- `getPendingPsychologists()` — fetches profiles with `role = 'psychologist'` and `license_verified = false`. Uses `createAdminSupabase()` to bypass RLS.

### `src/features/admin/components/pending-verification.tsx`

- Client Component
- Table listing unverified psychologists: avatar, fullName, licenseNumber, document link, actions
- Verificar / Rechazar buttons per row
- Uses `toast()` from sonner for feedback (not `alert()`)
- Opens `<Dialog>` (shadcn) for detail view

### `src/features/admin/components/verification-detail.tsx`

- Uses shadcn `<Dialog>`, `<DialogContent>`, `<DialogHeader>`
- Shows: displayName, fullName, licenseNumber, licenseDocument link, createdAt
- Verificar / Rechazar buttons

### `src/app/admin/page.tsx`

- Server Component
- Calls `getPendingPsychologists()`
- Renders `<PendingVerification>`

## Database

No schema changes required. Tables already exist:
- `admin_roles` (id, user_id, created_at)
- `psychologist_profiles` with `license_verified` column
- `profiles` with `role` column

## Routes

| Path | File | Description |
|------|------|-------------|
| `/admin` | `src/app/admin/page.tsx` | Pending verifications list |
| `/admin` | `src/app/admin/layout.tsx` | Sidebar layout (already exists) |

## Auth / RLS

- Admin route already protected in `middleware.ts` via `auth.getUser()` + `admin_roles` check
- `admin_roles` has `admin_read_own` RLS policy
- Actions use `createAdminSupabase()` (service_role) for all writes

## Testing

- `src/features/admin/actions.test.ts` — unit tests for all 3 actions (auth guard, success, error)
- `src/features/admin/components/pending-verification.test.tsx` — render states (empty, with data)
- `src/features/admin/components/verification-detail.test.tsx` — render + button callbacks

## Deviations from Original Plan

- `alert()`/`prompt()` replaced with sonner `toast()`
- Inline modal replaced with shadcn `<Dialog>`
- Added test files
