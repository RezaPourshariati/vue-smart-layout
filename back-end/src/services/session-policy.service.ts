import type { ISession } from '../types/auth.js'

const DEFAULT_REFRESH_LIFETIME_MS = 1000 * 60 * 60 * 24 * 2 // 2d
const DEFAULT_IDLE_TIMEOUT_MS = 1000 * 60 * 30 // 30m
const DEFAULT_ABSOLUTE_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 30 // 30d
const DEFAULT_LAST_USED_TOUCH_INTERVAL_MS = 1000 * 30 // 30s
export type SessionExpiryCode = 'SESSION_IDLE_EXPIRED' | 'SESSION_ABSOLUTE_EXPIRED'

function readMsEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw)
    return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0)
    return fallback
  return parsed
}

export function getRefreshLifetimeMs(): number {
  return readMsEnv('REFRESH_TOKEN_LIFETIME_MS', DEFAULT_REFRESH_LIFETIME_MS)
}

export function getRefreshLifetimeSeconds(): number {
  // jsonwebtoken accepts integer seconds for numeric expiresIn values.
  return Math.max(1, Math.floor(getRefreshLifetimeMs() / 1000))
}

export function getSessionIdleTimeoutMs(): number {
  return readMsEnv('SESSION_IDLE_TIMEOUT_MS', DEFAULT_IDLE_TIMEOUT_MS)
}

export function getSessionAbsoluteTimeoutMs(): number {
  return readMsEnv('SESSION_ABSOLUTE_TIMEOUT_MS', DEFAULT_ABSOLUTE_TIMEOUT_MS)
}

export function getSessionLastUsedTouchIntervalMs(): number {
  const interval = readMsEnv('SESSION_LAST_USED_TOUCH_INTERVAL_MS', DEFAULT_LAST_USED_TOUCH_INTERVAL_MS)
  // Ensure touch interval never exceeds idle timeout; otherwise active sessions could still expire.
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
