# Error Codes and Meanings

## Primary Question

Which **stable `code` values** does the auth/session layer return, and how should the client react?

## Short answer

- **`SESSION_IDLE_EXPIRED`** / **`SESSION_ABSOLUTE_EXPIRED`**: session policy fired; clear client auth and prompt re-login with targeted UX.
- Prefer branching on **`code`**, not parsing **`message`** strings.
- Full list below is intentionally limited to this layer; expand only when APIs emit stable codes.

## Session Policy Codes

### `SESSION_IDLE_EXPIRED`

- **Meaning:** user session exceeded configured inactivity window.
- **Returned by:** middleware/session checks and `/api/auth/refresh`.
- **Expected frontend behavior:** clear auth state, redirect/login gate, show idle-expiry message.

### `SESSION_ABSOLUTE_EXPIRED`

- **Meaning:** user session exceeded maximum total session age.
- **Returned by:** middleware/session checks and `/api/auth/refresh`.
- **Expected frontend behavior:** clear auth state, force re-auth, show absolute-expiry message.

## Generic Auth Failures

- **`Not authorized, please login`**
  - Invalid/missing token or no active session record.
- **`User suspended, please contact support`**
  - Authenticated identity exists but account status blocks access.

## Key Code Anchors

```ts
// back-end/src/features/auth/controller.ts (and auth middleware)
throw new UnauthorizedError('Session expired, please login again', sessionExpiryCode)
// error middleware serializes: { code, message }
```

```ts
// front-end/src/features/auth/api/auth.api.ts
const error = new AuthApiError(data.message || 'Authentication request failed')
error.code = typeof data.code === 'string' ? data.code : undefined
throw error
```

## Out of scope for this page

- Policy formulas — see [`../security/session-policy.md`](../security/session-policy.md).
- Env tuning — see [`config-matrix.md`](./config-matrix.md).

## Usage Notes

- Prefer handling by `code` rather than free-text message matching.
- Keep messages user-facing and stable, but treat code as authoritative behavior trigger.

## Current Scope / Intentional Non-Goals

- No exhaustive API error catalog for all features.
- No machine-readable error schema document yet.
