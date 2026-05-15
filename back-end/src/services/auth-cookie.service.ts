import type { Response } from 'express'
import crypto from 'node:crypto'
import { config } from '../config/env.js'
import { getRefreshLifetimeMs } from './session-policy.service.js'

/** Supertest uses HTTP; browsers require `Secure` for `SameSite=None`. Use lax + non-secure in `NODE_ENV=test`. */
function cookieFlags(): { secure: boolean, sameSite: 'lax' | 'none' } {
  if (config.isTest)
    return { secure: false, sameSite: 'lax' }
  return { secure: true, sameSite: 'none' }
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  const csrfToken = crypto.randomBytes(24).toString('hex')
  const { secure, sameSite } = cookieFlags()
  res.cookie('accessToken', accessToken, {
    path: '/',
    httpOnly: true,
    sameSite,
    secure,
    maxAge: 1000 * 60 * 60 * 4,
  })
  if (refreshToken) {
    const refreshLifetimeMs = getRefreshLifetimeMs()
    res.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite,
      secure,
      expires: new Date(Date.now() + refreshLifetimeMs),
    })
  }
  res.cookie('csrfToken', csrfToken, {
    path: '/',
    httpOnly: false,
    sameSite,
    secure,
    maxAge: 1000 * 60 * 60 * 4,
  })
}

export function clearAuthCookies(res: Response): void {
  const { secure, sameSite } = cookieFlags()
  res.cookie('accessToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite, secure })
  res.cookie('refreshToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite, secure })
  res.cookie('csrfToken', '', { path: '/', httpOnly: false, expires: new Date(0), sameSite, secure })
}
