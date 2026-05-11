import type { NextFunction, Request, Response } from 'express'

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])
const EXEMPT_WRITE_PATH_PREFIXES = [
  '/login',
  '/register',
  '/refresh',
  '/forgotPassword',
  '/resetPassword/',
  '/verifyUser/',
  '/sendLoginCode/',
  '/loginWithCode/',
  '/google/callback',
]

function isExemptWritePath(path: string): boolean {
  return EXEMPT_WRITE_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix))
}

export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  if (!WRITE_METHODS.has(req.method)) {
    next()
    return
  }

  // Public bootstrap/auth routes are exempt because they can precede CSRF cookie issuance.
  if (isExemptWritePath(req.path)) {
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
