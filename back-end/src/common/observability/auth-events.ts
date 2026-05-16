import type { Request } from 'express'
import { config } from '../../config/env.js'

export type AuthTelemetryEvent
  = | 'auth.refresh_success'
    | 'auth.refresh_failed'
    | 'auth.middleware_denied'
    | 'auth.session_destroyed_idle_or_absolute'
    | 'auth.sessions_revoked'

function basePayload(req: Request) {
  return {
    category: 'auth',
    correlationId: req.correlationId ?? null,
    method: req.method,
    path: req.path,
    ip: req.ip,
    ts: new Date().toISOString(),
  } as const
}

/** One JSON line per event for ingestion (Datadog/Honeycomb/stack drivers). Disabled in vitest NODE_ENV=test. */
export function emitAuthEvent(
  req: Request,
  event: AuthTelemetryEvent,
  detail: Record<string, unknown> = {},
): void {
  if (!config.logAuthTelemetry)
    return
  console.log(JSON.stringify({
    level: event.endsWith('_failed') || event.endsWith('denied') ? 'warn' : 'info',
    ...basePayload(req),
    event,
    ...detail,
  }))
}
