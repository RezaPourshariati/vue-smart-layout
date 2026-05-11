# Config Matrix

## Primary Question

Which **environment variables** control auth/session behavior, what are sensible defaults, and what breaks if they are wrong?

## Short answer

- **`JWT_SECRET`** / **`JWT_REFRESH_SECRET`**: signing; mismatch ⇒ immediate auth failures.
- **`SESSION_*`**: idle, absolute, touch interval, refresh rolling window — tune together (touch interval must not exceed idle; startup warns if mis-set).
- See tables below for defaults and effects.

## Session and Token Config


| Variable                              | Default                  | Used In                        | Effect                         |
| ------------------------------------- | ------------------------ | ------------------------------ | ------------------------------ |
| `JWT_SECRET`                          | required                 | token signing/verification     | Access token validity          |
| `JWT_REFRESH_SECRET`                  | fallback to `JWT_SECRET` | refresh signing/verification   | Refresh token integrity        |
| `REFRESH_TOKEN_LIFETIME_MS`           | `172800000` (2d)         | refresh JWT + session policy + cookie expiry | Rolling refresh window |
| `SESSION_IDLE_TIMEOUT_MS`             | `1800000` (30m)          | session policy checks          | Max inactivity before logout   |
| `SESSION_LAST_USED_TOUCH_INTERVAL_MS` | `30000` (30s)            | middleware touch logic         | DB write throttle for activity |
| `SESSION_ABSOLUTE_TIMEOUT_MS`         | `2592000000` (30d)       | session policy checks          | Max total session age          |


## Email/Operational Config (Auth Adjacent)


| Variable                      | Default | Used In         | Effect                    |
| ----------------------------- | ------- | --------------- | ------------------------- |
| `EMAIL_HOST`                  | none    | mail transport  | SMTP server               |
| `EMAIL_USER`                  | none    | mail transport  | SMTP username             |
| `EMAIL_PASS`                  | none    | mail transport  | SMTP credential           |
| `EMAIL_PORT`                  | `587`   | mail transport  | SMTP port behavior        |
| `DEV_LOGIN_CODE_CONSOLE_ONLY` | `false` | send-login-code | Dev bypass for email send |


## Key Code Anchors

```ts
// back-end/src/services/session-policy.service.ts
return readMsEnv('SESSION_IDLE_TIMEOUT_MS', DEFAULT_IDLE_TIMEOUT_MS)
```

```ts
// back-end/src/server.ts
warnOnSessionPolicyMisconfiguration()
// warns on:
// - touch interval > idle timeout (clamped)
// - refresh lifetime < idle timeout
// - absolute timeout < idle timeout
```

## Out of scope for this page

- Behavioral flows — see [`../flows/`](../flows) and [`../architecture/auth-and-session-architecture.md`](../architecture/auth-and-session-architecture.md).
- Why explicit refresh — see [`../decisions/adr-001-explicit-refresh-authority.md`](../decisions/adr-001-explicit-refresh-authority.md).

## Configuration Guidance

- Keep `SESSION_LAST_USED_TOUCH_INTERVAL_MS <= SESSION_IDLE_TIMEOUT_MS`.
- Start with 30m idle and adjust using observed expiry rates.
- Use longer absolute timeout only if business UX requires persistent sessions.
- Keep production secrets in secure secret stores (not checked-in env files).

## Current Scope / Intentional Non-Goals

- No per-environment config overlay doc yet.
- No dynamic runtime policy reload support.

