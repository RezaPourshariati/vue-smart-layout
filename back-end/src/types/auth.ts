import type { Request } from 'express'
import type { Document, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  photo: string
  phone: string
  bio: string
  role: 'subscriber' | 'author' | 'admin' | 'suspended'
  isVerified: boolean
  userAgent: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IToken extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  verificationToken: string
  resetToken: string
  refreshToken: string
  loginToken: string
  createdAt: Date
  expiresAt: Date
}

export interface AuthRequest extends Request {
  user?: IUser
}

export interface AuthJwtPayload {
  id: string
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
