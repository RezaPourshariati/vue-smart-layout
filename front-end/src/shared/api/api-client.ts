import { refreshSession } from '@/features/auth/api/auth-session.api'

function resolveApiRoot(): string {
  const explicit = import.meta.env.VITE_API_ROOT_URL?.replace(/\/$/, '')
  if (explicit)
    return explicit
  const legacyAuth = import.meta.env.VITE_API_BASE_URL
  if (legacyAuth)
    return legacyAuth.replace(/\/api\/auth\/?$/, '')
  return 'http://localhost:4000'
}

export const API_ROOT = resolveApiRoot()
export const AUTH_API_BASE = `${API_ROOT}/api/auth`
export const USERS_API_BASE = `${API_ROOT}/api/users`

export function getCookie(name: string): string | null {
  const pattern = new RegExp(`(?:^|; )${name}=([^;]*)`)
  const match = document.cookie.match(pattern)
  if (!match || match.length < 2)
    return null
  return decodeURIComponent(match[1] || '')
}

export interface ApiClientOptions {
  baseUrl: string
  skipRefreshRetryPaths: Set<string>
}

export function createApiClient({ baseUrl, skipRefreshRetryPaths }: ApiClientOptions) {
  return async function request<T>(
    path: string,
    options?: RequestInit,
    canRetryWithRefresh = true,
  ): Promise<T> {
    const method = options?.method?.toUpperCase() || 'GET'
    const csrfToken = method !== 'GET' && method !== 'HEAD' ? getCookie('csrfToken') : null

    const response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const canTryRefresh
        = canRetryWithRefresh
          && response.status === 401
          && !skipRefreshRetryPaths.has(path)
      if (canTryRefresh) {
        try {
          await refreshSession()
          return await request<T>(path, options, false)
        }
        catch {
          // Surface the original API error below.
        }
      }
      const error = new Error((data as { message?: string }).message || 'Request failed')
      const code = (data as { code?: string }).code
      if (code)
        (error as Error & { code?: string }).code = code
      throw error
    }

    return data as T
  }
}
