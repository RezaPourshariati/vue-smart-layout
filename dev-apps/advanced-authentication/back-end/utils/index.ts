import type { Types } from 'mongoose'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

export function generateToken(id: Types.ObjectId | string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign({ id: id.toString() }, secret)
}

export function generateRefreshToken({ refreshToken, userId }: { refreshToken: string, userId: Types.ObjectId | string }): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign({ refreshToken, userId: userId.toString() }, secret, { expiresIn: '1d' })
}

// Hash Token ---> hashing tokens before it saves to the database.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.toString()).digest('hex')
}
