import { AUTH_API_BASE, getCookie } from '@/shared/api/api-client'

let refreshInFlight: Promise<{ message: string }> | null = null

export async function refreshSession(): Promise<{ message: string }> {
  if (refreshInFlight)
    return await refreshInFlight

  refreshInFlight = (async () => {
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
  })()

  try {
    return await refreshInFlight
  }
  finally {
    refreshInFlight = null
  }
}
