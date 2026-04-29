import type { NextFunction, Response } from 'express'
import type { AuthRequest } from '../types/auth.js'

export function requireRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const hasRequiredRole = roles.includes(req.user.role)
    if (!hasRequiredRole) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    next()
  }
}
