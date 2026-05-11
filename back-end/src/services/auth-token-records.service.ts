import type { Types } from 'mongoose'
import Token from '../models/token.model.js'

type TokenUserId = Types.ObjectId | string

const ONE_HOUR_MS = 60 * 60 * 1000

async function replaceUserTokenRecord(payload: {
  userId: TokenUserId
  loginToken?: string
  verificationToken?: string
  resetToken?: string
  ttlMs?: number
}): Promise<void> {
  const {
    userId,
    loginToken = '',
    verificationToken = '',
    resetToken = '',
    ttlMs = ONE_HOUR_MS,
  } = payload

  const existing = await Token.findOne({ userId })
  if (existing)
    await existing.deleteOne()

  await new Token({
    userId,
    loginToken,
    verificationToken,
    resetToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  }).save()
}

export async function replaceWithLoginCodeRecord(userId: TokenUserId, encryptedLoginCode: string): Promise<void> {
  await replaceUserTokenRecord({ userId, loginToken: encryptedLoginCode })
}

export async function replaceWithVerificationRecord(userId: TokenUserId, verificationTokenHash: string): Promise<void> {
  await replaceUserTokenRecord({ userId, verificationToken: verificationTokenHash })
}

export async function replaceWithResetRecord(userId: TokenUserId, resetTokenHash: string): Promise<void> {
  await replaceUserTokenRecord({ userId, resetToken: resetTokenHash })
}

export async function findValidVerificationRecord(verificationTokenHash: string) {
  return await Token.findOne({
    verificationToken: verificationTokenHash,
    expiresAt: { $gt: Date.now() },
  })
}

export async function findValidResetRecord(resetTokenHash: string) {
  return await Token.findOne({
    resetToken: resetTokenHash,
    expiresAt: { $gt: Date.now() },
  })
}

export async function findValidLoginCodeRecord(userId: TokenUserId) {
  return await Token.findOne({
    userId,
    loginToken: { $ne: '' },
    expiresAt: { $gt: Date.now() },
  })
}
