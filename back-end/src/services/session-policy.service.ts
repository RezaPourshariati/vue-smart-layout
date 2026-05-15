import type { ISession } from '../types/auth.js'
import { config } from '../config/env.js'

export type SessionExpiryCode = 'SESSION_IDLE_EXPIRED' | 'SESSION_ABSOLUTE_EXPIRED'

export function getRefreshLifetimeMs(): number {
  return config.session.refreshLifetimeMs
}

export function getRefreshLifetimeSeconds(): number {
  return Math.max(1, Math.floor(getRefreshLifetimeMs() / 1000))
}

export function getSessionIdleTimeoutMs(): number {
  return config.session.idleTimeoutMs
}

export function getSessionAbsoluteTimeoutMs(): number {
  return config.session.absoluteTimeoutMs
}

export function getSessionLastUsedTouchIntervalMs(): number {
  const interval = config.session.lastUsedTouchIntervalMs
  return Math.min(interval, getSessionIdleTimeoutMs())
}

export function buildSessionTimestamps(sessionStartedAt?: Date) {
  const now = new Date()
  return {
    createdAt: now,
    lastUsedAt: now,
    expiresAt: new Date(now.getTime() + getRefreshLifetimeMs()),
    sessionStartedAt: sessionStartedAt || now,
  }
}

export function isSessionExpired(token: Pick<ISession, 'sessionStartedAt' | 'lastUsedAt'>, nowMs = Date.now()): boolean {
  return getSessionExpiryCode(token, nowMs) !== null
}

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

export function shouldTouchLastUsed(lastUsedAt: Date, nowMs = Date.now()): boolean {
  return nowMs - lastUsedAt.getTime() >= getSessionLastUsedTouchIntervalMs()
}
