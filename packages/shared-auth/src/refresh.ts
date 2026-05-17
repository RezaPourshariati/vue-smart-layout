import type { ApiMessageResponse } from '@adaptive-auth/shared-types'
import type { RefreshSessionOptions } from './types.js'

export function createRefreshSession({
  authApiBase,
  getCookie,
  lockName = 'adaptive-auth:session-refresh',
}: RefreshSessionOptions): () => Promise<ApiMessageResponse> {
  let refreshInFlight: Promise<ApiMessageResponse> | null = null

  async function fetchRefreshOnce(): Promise<ApiMessageResponse> {
    const csrfToken = getCookie('csrfToken')
    const response = await fetch(`${authApiBase}/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw Object.assign(
        new Error((data as { message?: string }).message || 'Refresh failed'),
        { code: (data as { code?: string }).code },
      )
    }
    return data as ApiMessageResponse
  }

  return async function refreshSession(): Promise<ApiMessageResponse> {
    if (refreshInFlight)
      return refreshInFlight

    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
    const runExclusive = (): Promise<ApiMessageResponse> =>
      locks?.request?.(lockName, { mode: 'exclusive' }, () => fetchRefreshOnce())
      ?? fetchRefreshOnce()

    refreshInFlight = runExclusive().finally(() => {
      refreshInFlight = null
    })

    return refreshInFlight
  }
}
