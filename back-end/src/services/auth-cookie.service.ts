import type { Response } from 'express'
import crypto from 'node:crypto'
import { getRefreshLifetimeMs } from './session-policy.service.js'

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  const csrfToken = crypto.randomBytes(24).toString('hex')
  res.cookie('accessToken', accessToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60 * 4,
  })
  if (refreshToken) {
    const refreshLifetimeMs = getRefreshLifetimeMs()
    res.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: new Date(Date.now() + refreshLifetimeMs),
    })
  }
  res.cookie('csrfToken', csrfToken, {
    path: '/',
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60 * 4,
  })
}

export function clearAuthCookies(res: Response): void {
  res.cookie('accessToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true })
  res.cookie('refreshToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true })
  res.cookie('csrfToken', '', { path: '/', httpOnly: false, expires: new Date(0), sameSite: 'none', secure: true })
}
