# Idle Timeout and Absolute Timeout Flow

## Primary Question

When does the server return **`SESSION_IDLE_EXPIRED`** vs **`SESSION_ABSOLUTE_EXPIRED`**, and where are those checks applied?

## Short answer

- **`SESSION_ABSOLUTE_EXPIRED`** if wall-clock exceeded **`sessionStartedAt + SESSION_ABSOLUTE_TIMEOUT_MS`** (evaluated first in code).
- **`SESSION_IDLE_EXPIRED`** if **`lastUsedAt + SESSION_IDLE_TIMEOUT_MS`** exceeded.
- Same checks apply on **middleware-protected requests** (via session row) and on **`/refresh`** before rotation.

## Policy Inputs

- `SESSION_IDLE_TIMEOUT_MS`
- `SESSION_ABSOLUTE_TIMEOUT_MS`
- `SESSION_LAST_USED_TOUCH_INTERVAL_MS` (throttled activity tracking)

## Flow: Access-Token Protected Request

1. Middleware verifies access token.
2. Middleware loads active session row from **`sessions`**.
3. Middleware computes expiry reason:
   - idle exceeded -> `SESSION_IDLE_EXPIRED`
   - absolute exceeded -> `SESSION_ABSOLUTE_EXPIRED`
4. If expired:
   - delete session token record
   - return `401` with expiry code.
5. If not expired:
   - optionally touch `lastUsedAt` (throttled)
   - continue request.

## Flow: Explicit Refresh (`/api/auth/refresh`)

1. Backend validates refresh cookie + **`sessions`** row.
2. Same expiry-code check runs.
3. If expired -> delete session + return `401` with code.
4. If valid -> rotate refresh token and issue fresh cookies.

## Key Code Anchors

### Expiry-code calculation

```ts
// back-end/src/services/session-policy.service.ts
const idleExceeded = token.lastUsedAt.getTime() + getSessionIdleTimeoutMs() <= nowMs
const absoluteExceeded = token.sessionStartedAt.getTime() + getSessionAbsoluteTimeoutMs() <= nowMs
```

### Middleware enforcement response

```ts
// back-end/src/common/middleware/auth.middleware.ts
res.status(401).json({
  code: sessionExpiryCode,
  message: 'Session expired, please login again',
})
```

### Frontend UX mapping

```ts
// front-end/src/features/auth/store/auth.store.ts
if (state.sessionExpiryCode === 'SESSION_IDLE_EXPIRED')
  return 'You were inactive for too long. Please log in again.'
```

## Out of scope for this page

- Env variable defaults — see [`../reference/config-matrix.md`](../reference/config-matrix.md).
- Refresh rotation steps — see [`refresh-flow.md`](./refresh-flow.md).

## Trade-offs

- Idle timeout improves security posture but may increase forced re-logins.
- Absolute timeout protects long-lived sessions but adds UX friction for always-on users.
- Throttled touches reduce DB load while keeping idle semantics accurate.

## Current Scope / Intentional Non-Goals

- No adaptive timeout by role/risk.
- No user-customizable timeout policy.
- No background keepalive pings solely to keep sessions alive.

## Scaling Considerations

1. Monitor expiry-code distribution to tune timeout values with real usage.
2. Move session-touch updates to lower-latency store if DB write pressure grows.
3. Introduce route-specific stricter policies only if threat model justifies it.
