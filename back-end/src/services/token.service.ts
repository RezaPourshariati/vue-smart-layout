import type { Types } from 'mongoose'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

export function generateToken(id: Types.ObjectId | string): string {
  const secret = process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_SECRET is not defined')
  return jwt.sign({ id: id.toString() }, secret, { expiresIn: '4h' })
}

export function generateRefreshToken({ refreshToken, userId }: { refreshToken: string, userId: Types.ObjectId | string }): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_REFRESH_SECRET or JWT_SECRET must be defined')
  return jwt.sign({ refreshToken, userId: userId.toString() }, secret, { expiresIn: '2d' })
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.toString()).digest('hex')
}
