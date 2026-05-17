import type { UserRole } from '@adaptive-auth/shared-types'
import type { Request } from 'express'
import type { Document, Types } from 'mongoose'
import type { TrustedDeviceSnapshot } from './device.js'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  photo: string
  phone: string
  bio: string
  role: UserRole
  isVerified: boolean
  userAgent: TrustedDeviceSnapshot[]
  createdAt: Date
  updatedAt: Date
}

/** Refresh-backed browser session (access JWT `sid` = this document `_id`). */
export interface ISession extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  /** SHA-256 hex of the opaque refresh secret (JWT still carries the raw value). */
  refreshTokenHash: string
  createdAt: Date
  expiresAt: Date
  sessionStartedAt: Date
  lastUsedAt: Date
}

/** One-time email verification token (hashed opaque value). */
export interface IEmailVerificationToken extends Document {
  userId: Types.ObjectId
  tokenHash: string
  createdAt: Date
  expiresAt: Date
}

/** One-time password reset token (hashed opaque value). */
export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId
  tokenHash: string
  createdAt: Date
  expiresAt: Date
}

/** Short-lived encrypted login code for new-device flow. */
export interface ILoginChallenge extends Document {
  userId: Types.ObjectId
  encryptedLoginCode: string
  createdAt: Date
  expiresAt: Date
}

export interface AuthRequest extends Request {
  user?: IUser
}

export interface AuthJwtPayload {
  id: string
  sid: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  refreshToken: string
  userId: string
  iat?: number
  exp?: number
}

export interface GooglePayload {
  email: string
  name: string
  picture: string
  sub: string
  email_verified?: boolean
}

export interface AutomatedEmailData {
  subject: string
  send_to: string
  reply_to: string
  template: string
  url: string
}

export interface PublicUser {
  _id: string
  name: string
  email: string
  roles: string[]
}
