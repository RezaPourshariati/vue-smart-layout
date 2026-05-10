# Auth and Session Architecture

## Primary Question

How does authentication and session handling work end-to-end in this stack (SPA + API), and where do responsibilities live?

## Short answer

- The SPA orchestrates refresh (`bootstrap`, `401` retry, shared in-flight dedupe); **`POST /api/auth/refresh`** is the only place refresh tokens rotate.
- Protected APIs use an **access token** plus a **server-side session row** in the token store; **`protect`** validates access + session policy but does not refresh.
- Session expiry (idle / absolute) is enforced server-side with stable **`SESSION_*_EXPIRED`** codes for UX and debugging.

## Current Architecture

- Frontend is the single refresh orchestrator for the SPA.
- Backend `/api/auth/refresh` is the single refresh authority.
- Access token is used for protected API calls.
- Refresh token is DB-backed and rotated on refresh.
- Session policy is enforced server-side (idle + absolute timeout).

## Key Components and Responsibilities

- **Frontend orchestration**
  - Bootstrap refresh on app startup.
  - One-time retry after `401`.
  - Shared in-flight refresh promise to dedupe concurrent `401` refresh attempts in one tab.
- **Backend `protect` middleware**
  - Validate access token only.
  - Validate active session record in token store.
  - Enforce session policy + attach user.
- **Backend `/refresh` endpoint**
  - Validate refresh token cookie and DB record.
  - Rotate refresh token.
  - Issue new access token and refresh cookie.

## Code Anchors

### Frontend refresh orchestration and retry

```ts
// front-end/src/features/auth/api/auth.api.ts
let refreshInFlight: Promise<{ message: string }> | null = null

if (canTryRefresh) {
  await refreshSession()
  return await request<T>(path, options, false)
}

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

### Backend access validation + session policy

```ts
// back-end/src/common/middleware/auth.middleware.ts
const verified = jwt.verify(accessToken, accessSecret) as AuthJwtPayload
const activeSession = await Token.findOne({
  userId: verified.id,
  refreshToken: { $ne: '' },
})
const sessionExpiryCode = getSessionExpiryCode(activeSession)
if (sessionExpiryCode) {
  await activeSession.deleteOne()
  res.status(401).json({ code: sessionExpiryCode, message: 'Session expired, please login again' })
}
```

### Backend refresh rotation

```ts
// back-end/src/features/auth/controller.ts
const verified = jwt.verify(refreshTokenCookie, refreshSecret) as { refreshToken: string, userId: string }
const userToken = await Token.findOne({ userId: verified.userId, refreshToken: verified.refreshToken, expiresAt: { $gt: Date.now() } })

const newRefreshTokenRaw = crypto.randomBytes(32).toString('hex') + user._id
const nextRefreshToken = generateRefreshToken({ refreshToken: newRefreshTokenRaw, userId: user._id })
const accessToken = generateToken(user._id)

userToken.refreshToken = newRefreshTokenRaw
await userToken.save()
setAuthCookies(res, accessToken, nextRefreshToken)
```

## Out of scope for this page

- Step-by-step refresh HTTP trace — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md).
- Idle vs absolute mechanics — see [`../flows/idle-timeout-and-absolute-timeout-flow.md`](../flows/idle-timeout-and-absolute-timeout-flow.md).
- JWT signing details and cookie attribute rationale — see [`../security/token-model-and-cookie-strategy.md`](../security/token-model-and-cookie-strategy.md).
- Env defaults — see [`../reference/config-matrix.md`](../reference/config-matrix.md).
- Vue Router **`meta`** guards, login **`redirect`/`session`** query — see [`../frontend/routing-auth-guards.md`](../frontend/routing-auth-guards.md).

## Design Rationale and Trade-offs

- **Chosen:** explicit frontend-orchestrated refresh.
- **Not chosen:** hybrid implicit middleware refresh.
- **Reason:** single refresh authority improves predictability, observability, and debugging.
- **Trade-off:** backend no longer auto-recovers tokens for clients that do not implement explicit refresh.

## Current Scope / Intentional Non-Goals

- Scope is SPA-first session orchestration.
- Multi-tab best-effort consistency is accepted.
- No global distributed lock for refresh rotations.
- No "session management UI" (list/kill per device) yet.

## Advanced Evolution Paths

Only meaningful next steps from current architecture:

1. Cross-tab refresh coordination (`BroadcastChannel`/storage lock) to reduce simultaneous tab refresh races.
2. Session observability (structured logs/metrics for refresh success/fail/reason codes).
3. Optional per-device session records for explicit "logout this device" and session listing.
