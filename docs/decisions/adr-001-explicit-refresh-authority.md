# ADR-001: Explicit Refresh Authority

- **Status:** Accepted
- **Date:** 2026-05-09

## Primary Question

Why should **`/api/auth/refresh`** be the **only** place that rotates refresh tokens, instead of also refreshing inside **`protect`** middleware?

## Short answer

- **Single authority** → predictable rotation order, clearer logs, fewer duplicate code paths.
- **SPA owns orchestration** (bootstrap + `401` retry + dedupe) → explicit failure/retry semantics.
- **Trade-off:** non-browser clients must call **`/refresh`** explicitly; no silent recovery in middleware.

## Context

The project originally had a hybrid model:

- explicit frontend `/refresh` handling, and
- implicit refresh behavior in backend `protect` middleware.

This created two refresh authorities and made rotation/debug flows harder to reason about.

## Decision

Adopt a single refresh authority:

- `/api/auth/refresh` is the only place where refresh rotation occurs.
- Frontend orchestrates refresh lifecycle explicitly (bootstrap + one-time 401 retry).
- `protect` middleware validates access token + session policy only.

## Rationale

- More deterministic session behavior.
- Better observability (all refresh events concentrated in one endpoint).
- Lower cognitive load for debugging and onboarding.

## Consequences

### Positive

- Clear separation of concerns.
- Reduced duplication of refresh logic.
- Lower chance of backend/frontend refresh authority conflicts.

### Negative

- Non-SPA or custom clients must implement explicit refresh flow.
- Initial failure/retry latency appears at client edge instead of hidden middleware recovery.

## Key Code Anchors

```ts
// back-end/src/common/middleware/auth.middleware.ts
// middleware validates access token + session policy; no refresh rotation
```

```ts
// back-end/src/features/auth/controller.ts
export const refreshSession = asyncHandler(async (req, res) => {
  // single refresh authority + rotation
})
```

```ts
// front-end/src/features/auth/api/auth.api.ts
// explicit refresh orchestration + in-flight dedupe
```

## Out of scope for this ADR

- Exact refresh handler implementation — see [`../flows/refresh-flow.md`](../flows/refresh-flow.md).
- Session policy math — see [`../security/session-policy.md`](../security/session-policy.md).

## Alternatives Considered

1. Keep hybrid model.
   - Rejected due to dual-authority complexity.
2. Middleware-only implicit refresh.
   - Rejected due to reduced explicit observability and weaker SPA control.

## Follow-up Actions

1. Monitor refresh failure patterns and session expiry reason distribution.
2. Add cross-tab refresh coordination if multi-tab race reports increase.
