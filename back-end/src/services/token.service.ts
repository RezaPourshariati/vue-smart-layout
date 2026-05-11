import type { Types } from 'mongoose'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { getRefreshLifetimeSeconds } from './session-policy.service.js'

export function generateToken(id: Types.ObjectId | string, sid: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_SECRET is not defined')
  return jwt.sign({ id: id.toString(), sid }, secret, { expiresIn: '4h' })
}

export function generateRefreshToken({ refreshToken, userId }: { refreshToken: string, userId: Types.ObjectId | string }): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_REFRESH_SECRET or JWT_SECRET must be defined')
  return jwt.sign(
    { refreshToken, userId: userId.toString() },
    secret,
    { expiresIn: getRefreshLifetimeSeconds() },
  )
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.toString()).digest('hex')
}
