import type { NextFunction, Response } from 'express'
import type { AuthRequest, JWTPayload, RefreshTokenPayload } from '@/types'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { generateToken } from '@/utils'
import Token from '../models/tokenModel.js'
import User from '../models/userModel.js'

const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken, refreshToken } = req.cookies as { accessToken?: string, refreshToken?: string }
    console.log('Current AccessToken:  ', accessToken)
    console.log('Current RefreshToken:  ', refreshToken)

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      res.status(500)
      throw new Error('JWT_SECRET is not defined')
    }

    if (accessToken) {
      // Verify token
      const verified = jwt.verify(accessToken, jwtSecret) as JWTPayload

      // Get user ID from token
      const user = await User.findById(verified.id).select('-password')

      if (!user) {
        res.status(404)
        throw new Error('User not found!')
      }

      if (user.role === 'suspended') {
        res.status(400)
        throw new Error('User suspended, please contact support')
      }
      req.user = user
      return next()
    }

    if (!accessToken && refreshToken) {
      const verified = jwt.verify(refreshToken, jwtSecret) as RefreshTokenPayload
      console.log(verified)

      const userToken = await Token.findOne({
        userId: verified.userId,
        refreshToken: verified.refreshToken,
      })
      console.log(userToken)

      if (!userToken) {
        res.status(401)
        throw new Error('Not authorized, please login')
      }

      const newAccessToken = generateToken(userToken.userId)
      console.log('New accessToken:    ', newAccessToken)

      // Send HTTP-only Cookie
      res.cookie('accessToken', newAccessToken, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 Hours
        sameSite: 'none',
        secure: true,
      })

      const user = await User.findById(verified.userId).select('-password')

      if (!user) {
        res.status(404)
        throw new Error('User not found!')
      }

      req.user = user
      next()
    }
    else if (!accessToken && !refreshToken) {
      res.status(401)
      throw new Error('Not authorized, please login')
    }
  }
  catch (error) {
    res.status(401)
    throw new Error('Not authorized, please login')
  }
})

const adminOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && req.user.role === 'admin') {
    next()
  }
  else {
    res.status(401)
    throw new Error('Not authorized as an admin, You don\'t allow this action, only admin can access this action')
  }
})

const authorOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && (req.user.role === 'author' || req.user.role === 'admin')) {
    next()
  }
  else {
    res.status(401)
    throw new Error('Not authorized as an author')
  }
})

const verifiedOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && req.user.isVerified) {
    next()
  }
  else {
    res.status(401)
    throw new Error('Not authorized, account not verified')
  }
})

export { adminOnly, authorOnly, protect, verifiedOnly }
