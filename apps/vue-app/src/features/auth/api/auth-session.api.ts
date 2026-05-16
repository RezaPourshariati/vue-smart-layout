import { AUTH_API_BASE, getCookie } from '@/shared/api/api-client'

let refreshInFlight: Promise<{ message: string }> | null = null

async function fetchRefreshOnce(): Promise<{ message: string }> {
  const csrfToken = getCookie('csrfToken')
  const response = await fetch(`${AUTH_API_BASE}/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw Object.assign(new Error((data as { message?: string }).message || 'Refresh failed'), {
      code: (data as { code?: string }).code,
    })
  }
  return data as { message: string }
}

/**
 * Rotates cookies via `/api/auth/refresh`. Serialized per-origin with the Web Locks API when supported
 * so multiple tabs do not hammer refresh concurrently; falls back to a single in-flight promise per tab.
 */
export async function refreshSession(): Promise<{ message: string }> {
  if (refreshInFlight)
    return refreshInFlight

  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined

  const runExclusive = (): Promise<{ message: string }> =>
    locks?.request?.('vue-smart-layout:session-refresh', { mode: 'exclusive' }, () => fetchRefreshOnce())
    ?? fetchRefreshOnce()

  refreshInFlight = runExclusive().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}
