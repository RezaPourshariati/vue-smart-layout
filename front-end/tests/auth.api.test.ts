import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/features/auth/api/auth.api'
import * as usersApi from '@/features/users/api/users.api'

function jsonResponse(body: unknown, init?: { ok?: boolean, status?: number }) {
  return Promise.resolve({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: () => Promise.resolve(body),
  }) as Promise<Response>
}

describe('auth.api', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    document.cookie = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getLoginStatus GETs /status on auth base', async () => {
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse(true))
    const result = await authApi.getLoginStatus()
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/status$/),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('logout POST sends x-csrf-token when cookie is set', async () => {
    document.cookie = 'csrfToken=abc123; Path=/'
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse({ message: 'ok' }))
    await authApi.logout()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/logout$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-csrf-token': 'abc123',
        }),
      }),
    )
  })
})

describe('users.api', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    document.cookie = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getCurrentUser GETs /me on users base', async () => {
    const user = {
      _id: '1',
      name: 'Test',
      email: 't@test.com',
      role: 'subscriber' as const,
      isVerified: true,
    }
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse(user))
    const result = await usersApi.getCurrentUser()
    expect(result).toEqual(user)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/users\/me$/),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('retries after refresh on 401 for protected paths', async () => {
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

    const result = await usersApi.getCurrentUser()
    expect(result).toEqual(user)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/auth\/refresh$/),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
