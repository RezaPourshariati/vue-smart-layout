# Session Policy

## Primary Question

How does the server decide that a session has expired for **idle** vs **absolute** timeout, and how is activity tracked without writing to the DB on every request?

## Short answer

- **Idle:** `lastUsedAt + SESSION_IDLE_TIMEOUT_MS` vs now.
- **Absolute:** `sessionStartedAt + SESSION_ABSOLUTE_TIMEOUT_MS` vs now (checked before idle in code).
- **Activity:** successful authenticated requests may update `lastUsedAt` only when **`shouldTouchLastUsed`** passes (throttled by `SESSION_LAST_USED_TOUCH_INTERVAL_MS`).

## Policy Model

- **Idle timeout:** session expires after configured inactivity.
- **Absolute timeout:** session expires after a fixed max age regardless of activity.
- **Refresh lifetime:** rolling refresh window for refresh cookie + token record.
- **Touch interval:** throttle DB writes when updating `lastUsedAt`.

## Configuration

```env
# back-end/.env.example
REFRESH_TOKEN_LIFETIME_MS=172800000
SESSION_IDLE_TIMEOUT_MS=1800000
SESSION_LAST_USED_TOUCH_INTERVAL_MS=30000
SESSION_ABSOLUTE_TIMEOUT_MS=2592000000
```

## Key Code Anchors

### Policy thresholds + expiry code computation

```ts
// back-end/src/services/session-policy.service.ts
export function getSessionExpiryCode(
  token: Pick<ISession, 'sessionStartedAt' | 'lastUsedAt'>,
  nowMs = Date.now(),
): SessionExpiryCode | null {
  const idleExceeded = token.lastUsedAt.getTime() + getSessionIdleTimeoutMs() <= nowMs
  const absoluteExceeded = token.sessionStartedAt.getTime() + getSessionAbsoluteTimeoutMs() <= nowMs
  if (absoluteExceeded)
    return 'SESSION_ABSOLUTE_EXPIRED'
  if (idleExceeded)
    return 'SESSION_IDLE_EXPIRED'
  return null
}
```

### Activity touch throttling

```ts
// back-end/src/services/session-policy.service.ts
export function shouldTouchLastUsed(lastUsedAt: Date, nowMs = Date.now()): boolean {
  return nowMs - lastUsedAt.getTime() >= getSessionLastUsedTouchIntervalMs()
}
```

### Enforcement in middleware

```ts
// back-end/src/common/middleware/auth.middleware.ts
const sessionExpiryCode = getSessionExpiryCode(activeSession)
if (sessionExpiryCode) {
  await activeSession.deleteOne()
  throw new UnauthorizedError('Session expired, please login again', sessionExpiryCode)
}
if (shouldTouchLastUsed(activeSession.lastUsedAt)) {
  activeSession.lastUsedAt = new Date()
  await activeSession.save()
}
```

## Out of scope for this page

- Where refresh rotates tokens — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md).
- Cookie and JWT shape — see [`token-model-and-cookie-strategy.md`](./token-model-and-cookie-strategy.md).
- Middleware-only validation path — see [`../backend/access-validation-middleware.md`](../backend/access-validation-middleware.md).

## Why this Design

- Idle timeout protects against abandoned sessions.
- Absolute timeout limits long-lived compromise windows.
- Throttled `lastUsedAt` updates avoid write amplification.
- Expiry reason codes improve UX/debuggability.

## Current Scope / Intentional Non-Goals

- No device-risk scoring policy.
- No IP- or geo-adaptive timeout policy.
- No dynamic per-role timeout policy.

## Production Hardening Ideas

1. Add per-environment policy profiles (dev/staging/prod) with startup validation.
2. Alerting on spikes of `SESSION_IDLE_EXPIRED` / `SESSION_ABSOLUTE_EXPIRED`.
3. Per-role policy overrides only if operational need appears (e.g., admin stricter idle timeout).
