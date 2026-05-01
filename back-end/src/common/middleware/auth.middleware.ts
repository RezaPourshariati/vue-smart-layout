import type { NextFunction, Response } from 'express'
import type { AuthJwtPayload, AuthRequest, RefreshTokenPayload } from '../../types/auth.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import Token from '../../models/token.model.js'
import User from '../../models/user.model.js'
import { generateToken } from '../../services/token.service.js'

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken, refreshToken } = req.cookies as { accessToken?: string, refreshToken?: string }
    const accessSecret = process.env.JWT_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    if (!accessSecret || !refreshSecret)
      throw new Error('JWT secrets are not defined')

    if (accessToken) {
      const verified = jwt.verify(accessToken, accessSecret) as AuthJwtPayload
      const user = await User.findById(verified.id).select('-password')
      if (!user)
        throw new Error('User not found!')
      if (user.role === 'suspended')
        throw new Error('User suspended, please contact support')
      req.user = user
      next()
      return
    }

    if (refreshToken) {
      const verified = jwt.verify(refreshToken, refreshSecret) as RefreshTokenPayload
      const userToken = await Token.findOne({ userId: verified.userId, refreshToken: verified.refreshToken })
      if (!userToken)
        throw new Error('Not authorized, please login')
      const newAccessToken = generateToken(userToken.userId)
      res.cookie('accessToken', newAccessToken, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 4),
        sameSite: 'none',
        secure: true,
      })
      const user = await User.findById(verified.userId).select('-password')
      if (!user)
        throw new Error('User not found!')
      req.user = user
      next()
      return
    }

    throw new Error('Not authorized, please login')
  }
  catch {
    res.status(401)
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
