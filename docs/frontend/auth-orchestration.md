# Frontend Auth Orchestration

## Primary Question

How does the SPA restore sessions on load, recover from `401`s, dedupe refresh calls, and surface session-expiry to the user?

## Short answer

- **`bootstrapAuth`** tries **`refreshSession`** first, then falls back to **`/status`** + **`/me`** when refresh is not needed or fails without a policy code.
- **`request()`** on **`401`** calls **`refreshSession`** once and retries the original call (paths like `/login` are excluded).
- **`refreshSession`** shares one **in-flight promise** so concurrent `401`s do not fire parallel **`POST /refresh`** in the same tab.
- Session expiry **`code`** from the API is stored for UX (e.g. login redirect query / notices).

## Orchestration Responsibilities

- Bootstrap session on startup.
- Recover from `401` once through refresh + retry.
- Deduplicate concurrent refresh calls in a tab.
- Surface session-expiry reasons in UI.

## State boundaries (Pinia)

- **`useAuthStore`**: current user, `bootstrapAuth`, login/register/logout, profile and account flows.
- **`useUsersStore`**: admin/author **user directory** (`list`, `fetchUsers`, `removeUser`, `upgradeRole`). Cleared on logout via a dynamic import from the auth store so session state stays separate from directory cache. The user list view binds **`DataTable :loading`** and disables row actions while **`usersStore.loading`** is true.

## Key Code Anchors

### Bootstrap flow

```ts
// front-end/src/features/auth/store/auth.store.ts
try {
  await authService.refreshSession()
  const refreshedUser = await authService.getCurrentUser()
  this.setUser(refreshedUser)
  this.clearSessionExpiryCode()
  return
}
catch (error) {
  const authError = error as AuthApiError
  if (authError?.code) {
    this.setSessionExpiryCode(authError.code)
    this.clearAuth()
    return
  }
}
```

### One-time retry after `401`

```ts
// front-end/src/features/auth/api/auth.api.ts
if (canTryRefresh) {
  await refreshSession()
  return await request<T>(path, options, false)
}
```

### Shared in-flight refresh dedupe

```ts
// front-end/src/features/auth/api/auth.api.ts
let refreshInFlight: Promise<{ message: string }> | null = null

export async function refreshSession(): Promise<{ message: string }> {
  if (refreshInFlight)
    return await refreshInFlight
  refreshInFlight = request<{ message: string }>('/refresh', { method: 'POST' }, false)
  try {
    return await refreshInFlight
  }
  finally {
    refreshInFlight = null
  }
}
```

## Out of scope for this page

- Backend enforcement of policy — see [`../backend/access-validation-middleware.md`](../backend/access-validation-middleware.md) and [`../security/session-policy.md`](../security/session-policy.md).
- Exact refresh endpoint behavior — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md).
- Router **`meta`** guards and login **`redirect`/`session`** query — see [`routing-auth-guards.md`](./routing-auth-guards.md).

## Trade-offs

- **Benefit:** deterministic, explicit refresh orchestration in one place.
- **Cost:** frontend must handle edge cases intentionally (retry limits, failures, UX messaging).

## Current Scope / Intentional Non-Goals

- Dedup is per-browser-tab, not cross-tab.
- No global request queue around refresh.
- No optimistic background refresh scheduler.

## Scaling Considerations

1. Add cross-tab refresh coordination (`BroadcastChannel`) if multi-tab races become common.
2. Add a short-lived retry backoff strategy for intermittent network errors around `/refresh`.
3. Add a telemetry hook for refresh attempt outcomes (success, failure code, retry count).
