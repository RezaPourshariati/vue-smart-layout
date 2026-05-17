import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthApi } from '../src/auth/api.js'
import { getBrowserCookie } from '../src/cookies/browser.js'
import { createRefreshSession } from '../src/refresh.js'
import { createUsersApi } from '../src/users/api.js'

function jsonResponse(body: unknown, init?: { ok?: boolean, status?: number }) {
  return Promise.resolve({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: () => Promise.resolve(body),
  }) as Promise<Response>
}

const AUTH_BASE = 'http://localhost:4000/api/auth'
const USERS_BASE = 'http://localhost:4000/api/users'

describe('shared-auth HTTP client', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    document.cookie = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getLoginStatus GETs /status on auth base', async () => {
    const refreshSession = createRefreshSession({
      authApiBase: AUTH_BASE,
      getCookie: getBrowserCookie,
    })
    const auth = createAuthApi({
      baseUrl: AUTH_BASE,
      getCookie: getBrowserCookie,
      refreshSession,
    })

    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse(true))
    const result = await auth.getLoginStatus()
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      `${AUTH_BASE}/status`,
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('logout POST sends x-csrf-token when cookie is set', async () => {
    const refreshSession = createRefreshSession({
      authApiBase: AUTH_BASE,
      getCookie: getBrowserCookie,
    })
    const auth = createAuthApi({
      baseUrl: AUTH_BASE,
      getCookie: getBrowserCookie,
      refreshSession,
    })

    document.cookie = 'csrfToken=abc123; Path=/'
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse({ message: 'ok' }))
    await auth.logout()
    expect(fetch).toHaveBeenCalledWith(
      `${AUTH_BASE}/logout`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-csrf-token': 'abc123',
        }),
      }),
    )
  })

  it('users client retries after refresh on 401', async () => {
    const refreshSession = createRefreshSession({
      authApiBase: AUTH_BASE,
      getCookie: getBrowserCookie,
    })
    const users = createUsersApi({
      baseUrl: USERS_BASE,
      getCookie: getBrowserCookie,
      refreshSession,
    })

    const user = {
      _id: '1',
      name: 'Test',
      email: 't@test.com',
      role: 'subscriber' as const,
      isVerified: true,
    }

    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse({ message: 'expired' }, { ok: false, status: 401 }))
      .mockImplementationOnce(() => jsonResponse({ message: 'Session refreshed' }))
      .mockImplementationOnce(() => jsonResponse(user))

    const result = await users.getCurrentUser()
    expect(result).toEqual(user)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${AUTH_BASE}/refresh`,
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
