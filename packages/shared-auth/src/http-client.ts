import type { HttpClientOptions } from './types.js'

export type HttpRequest = <T>(
  path: string,
  options?: RequestInit,
  canRetryWithRefresh?: boolean,
) => Promise<T>

export function createHttpClient(httpClientOptions: HttpClientOptions): HttpRequest {
  const { baseUrl, getCookie, refreshSession, skipRefreshRetryPaths } = httpClientOptions

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
