# Token Model and Cookie Strategy

## Primary Question

What tokens exist (access vs refresh), how are they represented (JWT + payload), and how are they delivered to the browser?

## Short answer

- **Access token:** JWT (`JWT_SECRET`), short TTL, carries `{ id, sid }` for session-bound API authorization.
- **Refresh token:** JWT wrapping `{ refreshToken, userId }` (`JWT_REFRESH_SECRET` or fallback); **raw** refresh secret lives in the DB row for rotation checks.
- Access and refresh are **`httpOnly` cookies** (`sameSite: 'none'`, `secure: true`); CSRF uses a readable `csrfToken` cookie + `x-csrf-token` header on protected write routes.

## Current Token Model

- **Access token**
  - JWT signed with `JWT_SECRET`
  - Payload contains `{ id, sid }`
  - Short-lived (4 hours)
  - Used for protected API authorization
- **Refresh token**
  - JWT signed with `JWT_REFRESH_SECRET` (fallback `JWT_SECRET`)
  - Contains `{ refreshToken, userId }`
  - Rotated only by `/api/auth/refresh`
- **Revocation store**
  - `Token` collection stores current refresh token record and session timestamps.

## Current Cookie Strategy

- `accessToken`: `httpOnly`, `sameSite: 'none'`, `secure: true`
- `refreshToken`: `httpOnly`, `sameSite: 'none'`, `secure: true`
- Cookies are rotated server-side on refresh.

## Key Code Anchors

### Access and refresh token signing

```ts
// back-end/src/services/token.service.ts
export function generateToken(id: Types.ObjectId | string, sid: string): string {
  return jwt.sign({ id: id.toString(), sid }, secret, { expiresIn: '4h' })
}

export function generateRefreshToken({ refreshToken, userId }: { refreshToken: string, userId: Types.ObjectId | string }): string {
  return jwt.sign({ refreshToken, userId: userId.toString() }, secret, { expiresIn: getRefreshLifetimeSeconds() })
}
```

### Cookie issuance

```ts
// back-end/src/services/auth-cookie.service.ts
setAuthCookies(res, accessToken, refreshToken)
// sets: accessToken (httpOnly), refreshToken (httpOnly), csrfToken (readable)
```

### Refresh cookie rotation

```ts
// back-end/src/features/auth/controller.ts
const nextRefreshToken = generateRefreshToken({ refreshToken: newRefreshTokenRaw, userId: user._id })
setAuthCookies(res, accessToken, nextRefreshToken)
```

## Out of scope for this page

- Idle/absolute session rules — see [`session-policy.md`](./session-policy.md).
- Full refresh sequence — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md).
- Error codes returned on expiry — see [`../reference/error-codes-and-meanings.md`](../reference/error-codes-and-meanings.md).

## Rationale and Trade-offs

- `httpOnly` cookies reduce XSS token theft risk.
- DB-backed refresh records provide revocation and policy enforcement.
- Cookie-based auth simplifies browser session continuity, but requires CORS/cookie settings discipline.

## Current Scope / Intentional Non-Goals

- No localStorage token strategy.
- No token binding to client certificates.
- No asymmetric key rotation infrastructure yet.

## Production Hardening Ideas

1. Add key rotation process with `kid` strategy for JWT secrets.
2. Add explicit cookie-domain strategy for multi-subdomain deployments.
3. Add refresh-token hashing at rest in token store.
