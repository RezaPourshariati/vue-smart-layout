# Access Validation Middleware

## Primary Question

What does **`protect`** validate on each protected request, and what does it explicitly **not** do anymore?

## Short answer

- Requires a valid **access token** and an **active session row** in the token store (non-empty refresh slot for that user).
- Runs **session policy** (`SESSION_IDLE_EXPIRED` / `SESSION_ABSOLUTE_EXPIRED`); may delete the row and return **`401` + code**.
- May **touch `lastUsedAt`** on a throttled interval.
- Does **not** read refresh cookies, rotate refresh tokens, or set new auth cookies.

## Current Behavior

`protect` performs:

1. Access token verification (`JWT_SECRET`).
2. Active session presence check in token store (`refreshToken != ''` for user).
3. Session policy enforcement (idle/absolute).
4. Throttled activity touch (`lastUsedAt`).
5. User lookup + role sanity checks.
6. Attach `req.user` and continue.

It does **not** rotate refresh tokens or mint new cookies.

## Key Code Anchor

```ts
// back-end/src/common/middleware/auth.middleware.ts
if (!accessToken)
  throw new Error('Not authorized, please login')

const verified = jwt.verify(accessToken, accessSecret) as AuthJwtPayload
const activeSession = await Token.findOne({ userId: verified.id, refreshToken: { $ne: '' } })
if (!activeSession)
  throw new Error('Not authorized, please login')

const sessionExpiryCode = getSessionExpiryCode(activeSession)
if (sessionExpiryCode) {
  await activeSession.deleteOne()
  res.status(401).json({ code: sessionExpiryCode, message: 'Session expired, please login again' })
}
```

## Out of scope for this page

- Refresh rotation — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md) and [`../decisions/adr-001-explicit-refresh-authority.md`](../decisions/adr-001-explicit-refresh-authority.md).
- Policy formulas — see [`../security/session-policy.md`](../security/session-policy.md).

## Why this Design

- Keeps middleware deterministic and side-effect-light.
- Centralizes refresh authority in `/refresh`.
- Makes auth failure modes easier to trace in logs.

## Current Scope / Intentional Non-Goals

- No automatic access-token renewal in middleware.
- No middleware-level refresh token parsing.
- No custom per-route session policy overrides.

## Production Hardening Ideas

1. Add a dedicated auth correlation id for all middleware denials.
2. Emit structured denial events (`code`, `route`, `userId`, `reason`).
3. Add rate-limited audit logging for repeated auth failures from same client.
