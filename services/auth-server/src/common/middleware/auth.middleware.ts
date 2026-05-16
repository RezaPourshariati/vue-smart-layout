import type { NextFunction, Response } from 'express'
import type { AuthJwtPayload, AuthRequest } from '../../types/auth.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { config } from '../../config/env.js'
import Session from '../../models/session.model.js'
import User from '../../models/user.model.js'
import { getSessionExpiryCode, shouldTouchLastUsed } from '../../services/session-policy.service.js'
import { assertUserNotSuspended } from '../../services/user-policy.service.js'
import { UnauthorizedError } from '../errors/app-error.js'
import { emitAuthEvent } from '../observability/auth-events.js'

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken } = req.cookies as { accessToken?: string }
    const accessSecret = config.jwtSecret
    if (!accessSecret)
      throw new Error('JWT_SECRET is not defined')
    if (!accessToken) {
      emitAuthEvent(req, 'auth.middleware_denied', { stage: 'access', reason: 'missing_access_cookie' })
      throw new UnauthorizedError('Not authorized, please login')
    }

    let verified: AuthJwtPayload
    try {
      verified = jwt.verify(accessToken, accessSecret) as AuthJwtPayload
    }
    catch (e) {
      const name = e instanceof Error ? e.name : 'JwtError'
      emitAuthEvent(req, 'auth.middleware_denied', {
        stage: 'access',
        reason: 'access_jwt_invalid',
        jwtError: name,
      })
      throw new UnauthorizedError('Not authorized, please login')
    }

    if (!verified?.sid) {
      emitAuthEvent(req, 'auth.middleware_denied', { stage: 'access', reason: 'missing_session_id_claim' })
      throw new UnauthorizedError('Not authorized, please login')
    }

    const activeSession = await Session.findOne({
      _id: verified.sid,
      userId: verified.id,
    })
    if (!activeSession) {
      emitAuthEvent(req, 'auth.middleware_denied', {
        stage: 'session_lookup',
        reason: 'session_not_found',
      })
      throw new UnauthorizedError('Not authorized, please login')
    }

    const sessionExpiryCode = getSessionExpiryCode(activeSession)
    if (sessionExpiryCode) {
      await activeSession.deleteOne()
      emitAuthEvent(req, 'auth.session_destroyed_idle_or_absolute', {
        expiryCode: sessionExpiryCode,
        userId: String(verified.id),
      })
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
      throw new UnauthorizedError('Not authorized, please login')
    assertUserNotSuspended(user)
    req.user = user
    next()
  }
  catch (error) {
    if (res.headersSent)
      return
    if (error instanceof Error)
      throw error
    throw new UnauthorizedError('Not authorized, please login')
  }
})

export const verifiedOnly = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user && req.user.isVerified) {
    next()
    return
  }
  throw new UnauthorizedError('Not authorized, account not verified')
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
