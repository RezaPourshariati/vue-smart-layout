import type { Types } from 'mongoose'
import EmailVerificationToken from '../models/email-verification-token.model.js'
import LoginChallenge from '../models/login-challenge.model.js'
import PasswordResetToken from '../models/password-reset-token.model.js'

type TokenUserId = Types.ObjectId | string

const ONE_HOUR_MS = 60 * 60 * 1000

export async function replaceWithLoginCodeRecord(userId: TokenUserId, encryptedLoginCode: string): Promise<void> {
  await LoginChallenge.deleteMany({ userId })
  await new LoginChallenge({
    userId,
    encryptedLoginCode,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ONE_HOUR_MS),
  }).save()
}

export async function replaceWithVerificationRecord(userId: TokenUserId, verificationTokenHash: string): Promise<void> {
  await EmailVerificationToken.deleteMany({ userId })
  await new EmailVerificationToken({
    userId,
    tokenHash: verificationTokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ONE_HOUR_MS),
  }).save()
}

export async function replaceWithResetRecord(userId: TokenUserId, resetTokenHash: string): Promise<void> {
  await PasswordResetToken.deleteMany({ userId })
  await new PasswordResetToken({
    userId,
    tokenHash: resetTokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ONE_HOUR_MS),
  }).save()
}

export async function findValidVerificationRecord(verificationTokenHash: string) {
  return EmailVerificationToken.findOne({
    tokenHash: verificationTokenHash,
    expiresAt: { $gt: Date.now() },
  })
}

export async function findValidResetRecord(resetTokenHash: string) {
  return PasswordResetToken.findOne({
    tokenHash: resetTokenHash,
    expiresAt: { $gt: Date.now() },
  })
}

export async function findValidLoginCodeRecord(userId: TokenUserId) {
  return LoginChallenge.findOne({
    userId,
    expiresAt: { $gt: Date.now() },
  })
}
