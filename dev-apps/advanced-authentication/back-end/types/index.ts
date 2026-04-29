import type { NextFunction, Request, Response } from 'express'
import type { Document, Types } from 'mongoose'

// User Document Interface
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

// Token Document Interface
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

// Extended Request with User
export interface AuthRequest extends Request {
  user?: IUser
}

// Login/Register Data
export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  bio?: string
  photo?: string
}

export interface PasswordChangeData {
  oldPassword: string
  password: string
}

// Email Data
export interface EmailData {
  subject: string
  send_to: string
  reply_to: string
  template: string
  url: string
}

// JWT Payload
export interface JWTPayload {
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

// Google Auth Payload
export interface GooglePayload {
  email: string
  name: string
  picture: string
  sub: string
  email_verified?: boolean
}

// Upgrade User Data
export interface UpgradeUserData {
  id: string
  role: string
}

// Automated Email Data
export interface AutomatedEmailData {
  subject: string
  send_to: string
  reply_to: string
  template: string
  url: string
}

// Express Handler Types
export type AsyncHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>

// Error Handler Type
export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void
