import type { Types } from 'mongoose'
import type { ISession } from '../types/auth.js'
import crypto from 'node:crypto'
import Session from '../models/session.model.js'
import { buildSessionTimestamps } from './session-policy.service.js'
import { generateRefreshToken, generateToken, hashRefreshToken } from './token.service.js'

type SessionUserId = Types.ObjectId | string

export async function issueRefreshTokenForUser(userId: SessionUserId): Promise<{ refreshToken: string, refreshTokenRaw: string }> {
  const refreshTokenRaw = crypto.randomBytes(32).toString('hex') + userId
  const refreshToken = generateRefreshToken({ refreshToken: refreshTokenRaw, userId })
  return { refreshToken, refreshTokenRaw }
}

export async function replaceUserSession(userId: SessionUserId, refreshTokenRaw: string): Promise<string> {
  await Session.deleteMany({ userId })
  const sessionTimestamps = buildSessionTimestamps()
  const createdSession = await new Session({
    userId,
    refreshTokenHash: hashRefreshToken(refreshTokenRaw),
    createdAt: sessionTimestamps.createdAt,
    expiresAt: sessionTimestamps.expiresAt,
    lastUsedAt: sessionTimestamps.lastUsedAt,
    sessionStartedAt: sessionTimestamps.sessionStartedAt,
  }).save()
  return createdSession._id.toString()
}

export async function rotateExistingSession(
  sessionDoc: ISession,
  userId: SessionUserId,
): Promise<{ refreshToken: string, sid: string }> {
  const refreshTokenRaw = crypto.randomBytes(32).toString('hex') + userId
  const refreshToken = generateRefreshToken({ refreshToken: refreshTokenRaw, userId })

  sessionDoc.refreshTokenHash = hashRefreshToken(refreshTokenRaw)
  const nextSession = buildSessionTimestamps(sessionDoc.sessionStartedAt)
  sessionDoc.createdAt = nextSession.createdAt
  sessionDoc.lastUsedAt = nextSession.lastUsedAt
  sessionDoc.expiresAt = nextSession.expiresAt
  sessionDoc.sessionStartedAt = nextSession.sessionStartedAt
  await sessionDoc.save()

  return { refreshToken, sid: sessionDoc._id.toString() }
}

export async function createFreshSessionTokens(
  userId: SessionUserId,
): Promise<{ accessToken: string, refreshToken: string, sid: string }> {
  const { refreshToken, refreshTokenRaw } = await issueRefreshTokenForUser(userId)
  const sid = await replaceUserSession(userId, refreshTokenRaw)
  const accessToken = generateToken(userId, sid)
  return { accessToken, refreshToken, sid }
}

export async function findSessionByRefreshRaw(
  userId: SessionUserId,
  refreshTokenRaw: string,
  options?: { requireUnexpiredRolling?: boolean },
): Promise<ISession | null> {
  const query: Record<string, unknown> = {
    userId,
    refreshTokenHash: hashRefreshToken(refreshTokenRaw),
  }
  if (options?.requireUnexpiredRolling)
    query.expiresAt = { $gt: Date.now() }
  return Session.findOne(query)
}
