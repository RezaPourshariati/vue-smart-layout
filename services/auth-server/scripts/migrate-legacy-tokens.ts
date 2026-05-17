import mongoose from 'mongoose'
import EmailVerificationToken from '../src/models/email-verification-token.model.js'
import LoginChallenge from '../src/models/login-challenge.model.js'
import PasswordResetToken from '../src/models/password-reset-token.model.js'
import Session from '../src/models/session.model.js'
import { hashRefreshToken } from '../src/services/token.service.js'
/**
 * One-off migration: legacy `tokens` collection → split collections + hashed refresh secrets.
 *
 * Usage:
 *   pnpm migrate:tokens              # apply
 *   pnpm migrate:tokens -- --dry-run # preview counts only
 *
 * Also, re-hashes any `sessions` rows that still store a plaintext refresh secret
 * (length > 64 hex chars — SHA-256 digests are exactly 64).
 */
import 'dotenv/config'

interface LegacyTokenDoc {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  verificationToken?: string
  resetToken?: string
  refreshToken?: string
  loginToken?: string
  createdAt?: Date
  expiresAt?: Date
  sessionStartedAt?: Date
  lastUsedAt?: Date
}

const dryRun = process.argv.includes('--dry-run')

function nonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0
}

function isLikelyPlaintextRefreshSecret(stored: string): boolean {
  return stored.length > 64
}

async function migrateLegacyTokens(): Promise<{
  sessions: number
  verifications: number
  resets: number
  loginChallenges: number
}> {
  const legacy = mongoose.connection.collection<LegacyTokenDoc>('tokens')
  const counts = { sessions: 0, verifications: 0, resets: 0, loginChallenges: 0 }
  const cursor = legacy.find({})

  for await (const doc of cursor) {
    const createdAt = doc.createdAt ?? new Date()
    const expiresAt = doc.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000)
    const sessionStartedAt = doc.sessionStartedAt ?? createdAt
    const lastUsedAt = doc.lastUsedAt ?? createdAt

    if (nonEmpty(doc.refreshToken)) {
      counts.sessions++
      if (!dryRun) {
        await Session.create({
          userId: doc.userId,
          refreshTokenHash: hashRefreshToken(doc.refreshToken),
          createdAt,
          expiresAt,
          sessionStartedAt,
          lastUsedAt,
        })
      }
    }

    if (nonEmpty(doc.verificationToken)) {
      counts.verifications++
      if (!dryRun) {
        await EmailVerificationToken.create({
          userId: doc.userId,
          tokenHash: doc.verificationToken,
          createdAt,
          expiresAt,
        })
      }
    }

    if (nonEmpty(doc.resetToken)) {
      counts.resets++
      if (!dryRun) {
        await PasswordResetToken.create({
          userId: doc.userId,
          tokenHash: doc.resetToken,
          createdAt,
          expiresAt,
        })
      }
    }

    if (nonEmpty(doc.loginToken)) {
      counts.loginChallenges++
      if (!dryRun) {
        await LoginChallenge.create({
          userId: doc.userId,
          encryptedLoginCode: doc.loginToken,
          createdAt,
          expiresAt,
        })
      }
    }
  }

  return counts
}

async function rehashPlaintextSessions(): Promise<number> {
  let updated = 0
  const sessions = await Session.find({}).select('refreshTokenHash').lean()
  for (const row of sessions) {
    const stored = row.refreshTokenHash
    if (!stored || !isLikelyPlaintextRefreshSecret(stored))
      continue
    updated++
    if (!dryRun)
      await Session.updateOne({ _id: row._id }, { $set: { refreshTokenHash: hashRefreshToken(stored) } })
  }
  return updated
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri)
    throw new Error('MONGO_URI is not defined')

  await mongoose.connect(mongoUri)
  const legacyCount = await mongoose.connection.collection('tokens').countDocuments()
  console.log(`[migrate:tokens] legacy tokens collection: ${legacyCount} document(s)`)
  console.log(`[migrate:tokens] mode: ${dryRun ? 'dry-run' : 'apply'}`)

  const migrated = await migrateLegacyTokens()
  console.log('[migrate:tokens] from legacy tokens →', migrated)

  const rehashed = await rehashPlaintextSessions()
  console.log(`[migrate:tokens] sessions re-hashed (plaintext → hash): ${rehashed}`)

  if (!dryRun && legacyCount > 0) {
    console.log('[migrate:tokens] legacy `tokens` collection left in place; drop manually after verification:')
    console.log('  db.tokens.drop()')
  }

  await mongoose.disconnect()
}

main().catch((error: unknown) => {
  console.error('[migrate:tokens] failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
