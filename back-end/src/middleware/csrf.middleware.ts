import type { NextFunction, Request, Response } from 'express'

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  if (!WRITE_METHODS.has(req.method)) {
    next()
    return
  }

  // Login is exempt because the user has no auth cookies yet.
  if (req.path === '/login') {
    next()
    return
  }

  const cookieToken = req.cookies.csrfToken as string | undefined
  const headerToken = req.get('x-csrf-token')

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ message: 'Invalid CSRF token' })
    return
  }

  next()
}
