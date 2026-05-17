import type { CookieAccess } from '../types.js'

export function getBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined')
    return null
  const pattern = new RegExp(`(?:^|; )${name}=([^;]*)`)
  const match = document.cookie.match(pattern)
  if (!match || match.length < 2)
    return null
  return decodeURIComponent(match[1] || '')
}

export const browserCookieAccess: CookieAccess = {
  get: getBrowserCookie,
}
