import type { Types } from 'mongoose'
import crypto from 'node:crypto'
import Token from '../models/token.model.js'
import { buildSessionTimestamps } from './session-policy.service.js'
import { generateRefreshToken, generateToken } from './token.service.js'

type SessionUserId = Types.ObjectId | string

export async function issueRefreshTokenForUser(userId: SessionUserId): Promise<{ refreshToken: string, refreshTokenRaw: string }> {
  const refreshTokenRaw = crypto.randomBytes(32).toString('hex') + userId
  const refreshToken = generateRefreshToken({ refreshToken: refreshTokenRaw, userId })
  return { refreshToken, refreshTokenRaw }
}

export async function replaceUserSession(userId: SessionUserId, refreshTokenRaw: string): Promise<string> {
  const userToken = await Token.findOne({ userId })
  if (userToken)
    await userToken.deleteOne()

  const sessionTimestamps = buildSessionTimestamps()
  const createdSession = await new Token({
    userId,
    refreshToken: refreshTokenRaw,
    createdAt: sessionTimestamps.createdAt,
    expiresAt: sessionTimestamps.expiresAt,
    lastUsedAt: sessionTimestamps.lastUsedAt,
    sessionStartedAt: sessionTimestamps.sessionStartedAt,
  }).save()
  return createdSession._id.toString()
}

export async function rotateExistingSession(
  userToken: InstanceType<typeof Token>,
  userId: SessionUserId,
): Promise<{ refreshToken: string, sid: string }> {
  const refreshTokenRaw = crypto.randomBytes(32).toString('hex') + userId
  const refreshToken = generateRefreshToken({ refreshToken: refreshTokenRaw, userId })

  userToken.refreshToken = refreshTokenRaw
  const nextSession = buildSessionTimestamps(userToken.sessionStartedAt)
  userToken.createdAt = nextSession.createdAt
  userToken.lastUsedAt = nextSession.lastUsedAt
  userToken.expiresAt = nextSession.expiresAt
  userToken.sessionStartedAt = nextSession.sessionStartedAt
  await userToken.save()

  return { refreshToken, sid: userToken._id.toString() }
}

export async function createFreshSessionTokens(
  userId: SessionUserId,
): Promise<{ accessToken: string, refreshToken: string, sid: string }> {
  const { refreshToken, refreshTokenRaw } = await issueRefreshTokenForUser(userId)
  const sid = await replaceUserSession(userId, refreshTokenRaw)
  const accessToken = generateToken(userId, sid)
  return { accessToken, refreshToken, sid }
}
