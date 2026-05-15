# Refresh Flow

## Primary Question

What happens from **`POST /api/auth/refresh`** through cookie updates, and when does the SPA call it?

## Short answer

- Triggered from **`bootstrapAuth`** and from **one `401` retry** in the API client (see frontend orchestration doc).
- Backend verifies refresh JWT + DB row + session policy; on success **rotates** stored refresh material and sets **new access + refresh cookies**.
- On policy expiry or invalid session, returns **`401`** with **`SESSION_*_EXPIRED`** or generic unauthorized.

## Primary Trigger Paths

1. App bootstrap (`bootstrapAuth`).
2. One-time retry after protected call returns `401`.

## Sequence

1. Frontend calls `POST /api/auth/refresh`.
2. Backend verifies refresh cookie JWT.
3. Backend finds matching session row in **`sessions`** (`userId + refreshToken + expiresAt > now`).
4. Backend checks session policy; if expired -> delete record + `401` with code.
5. Backend rotates refresh token raw value, updates **`sessions`** timestamps.
6. Backend sets new access + refresh cookies.
7. Frontend retries failed request once (or continues bootstrap fetch user).

## Key Code Anchors

### Frontend refresh call + dedupe

```ts
// front-end/src/features/auth/api/auth.api.ts
refreshInFlight = request<{ message: string }>('/refresh', { method: 'POST' }, false)
```

### Backend refresh endpoint

```ts
// back-end/src/features/auth/controller.ts
const verified = jwt.verify(refreshTokenCookie, refreshSecret) as { refreshToken: string, userId: string }
const userToken = await findSessionByRefreshRaw(verified.userId, verified.refreshToken, {
  requireUnexpiredRolling: true,
})
```

### Rotation + cookie issuance

```ts
// back-end/src/features/auth/controller.ts
const { refreshToken: nextRefreshToken, sid } = await rotateExistingSession(userToken, user._id)
const accessToken = generateToken(user._id, sid)
setAuthCookies(res, accessToken, nextRefreshToken)
```

## Out of scope for this page

- Middleware access-only path — see [`../backend/access-validation-middleware.md`](../backend/access-validation-middleware.md).
- Idle vs absolute definitions — see [`idle-timeout-and-absolute-timeout-flow.md`](./idle-timeout-and-absolute-timeout-flow.md).

## Failure Modes

- `401 Not authorized, please login`:
  - missing/invalid refresh cookie,
  - no matching **`sessions`** row.
- `401` with `SESSION_IDLE_EXPIRED` or `SESSION_ABSOLUTE_EXPIRED`:
  - policy-enforced session termination.

## Current Scope / Intentional Non-Goals

- No proactive refresh timer before access expiry.
- No cross-tab synchronization lock for refresh.
- No refresh endpoint for non-cookie token transport.

## Advanced Evolution Paths

1. Cross-tab refresh lock (BroadcastChannel/localStorage lock) to minimize race churn.
2. Add refresh latency and success-rate telemetry.
3. Add session list endpoint to support explicit device/session management UX.
