import type { NextFunction, Response } from 'express'
import type { AuthJwtPayload, AuthRequest } from '../../types/auth.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import Token from '../../models/token.model.js'
import User from '../../models/user.model.js'
import { getSessionExpiryCode, shouldTouchLastUsed } from '../../services/session-policy.service.js'

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken } = req.cookies as { accessToken?: string }
    const accessSecret = process.env.JWT_SECRET
    if (!accessSecret)
      throw new Error('JWT_SECRET is not defined')
    if (!accessToken)
      throw new Error('Not authorized, please login')

    const verified = jwt.verify(accessToken, accessSecret) as AuthJwtPayload
    const activeSession = await Token.findOne({
      userId: verified.id,
      refreshToken: { $ne: '' },
    })
    if (!activeSession)
      throw new Error('Not authorized, please login')

    const sessionExpiryCode = getSessionExpiryCode(activeSession)
    if (sessionExpiryCode) {
      await activeSession.deleteOne()
      res.status(401).json({
        code: sessionExpiryCode,
        message: 'Session expired, please login again',
      })
      return
    }
    if (shouldTouchLastUsed(activeSession.lastUsedAt)) {
      activeSession.lastUsedAt = new Date()
      await activeSession.save()
    }

    const user = await User.findById(verified.id).select('-password')
    if (!user)
      throw new Error('User not found!')
    if (user.role === 'suspended')
      throw new Error('User suspended, please contact support')
    req.user = user
    next()
  }
  catch (error) {
    if (res.headersSent)
      return
    res.status(401)
    if (error instanceof Error)
      throw error
    throw new Error('Not authorized, please login')
  }
})

export const adminOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && req.user.role === 'admin') {
    next()
    return
  }
  res.status(401)
  throw new Error('Not authorized as an admin')
})

export const authorOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && (req.user.role === 'author' || req.user.role === 'admin')) {
    next()
    return
  }
  res.status(401)
  throw new Error('Not authorized as an author')
})

export const verifiedOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && req.user.isVerified) {
    next()
    return
  }
  res.status(401)
  throw new Error('Not authorized, account not verified')
})

export const requireAuth = protect
export const attachAuthUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await protect(req, res, next)
  }
  catch {
    next()
  }
})
