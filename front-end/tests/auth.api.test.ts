import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/features/auth/api/auth.api'

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

  it('getLoginStatus GETs /status', async () => {
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse(true))
    const result = await authApi.getLoginStatus()
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/status$/),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('sends x-csrf-token when cookie is set', async () => {
    document.cookie = 'csrfToken=abc123; Path=/'
    vi.mocked(fetch).mockImplementationOnce(() => jsonResponse({ message: 'ok' }))
    await authApi.logout()
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-csrf-token': 'abc123',
        }),
      }),
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

    const result = await authApi.getCurrentUser()
    expect(result).toEqual(user)
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
