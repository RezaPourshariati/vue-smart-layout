import type { NextFunction, Response } from 'express'
import type { AuthRequest } from '../../types/auth.js'
import asyncHandler from 'express-async-handler'
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js'

/** Require authenticated user whose role matches one of `roles`. */
export function requireRoles(roles: string[]) {
  return asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user)
      throw new UnauthorizedError('Not authorized, please login')
    if (!roles.includes(req.user.role))
      throw new ForbiddenError('Insufficient permissions')
    next()
  })
}
