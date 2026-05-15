import type {
  AuthCredentials,
  AuthUser,
  ChangePasswordPayload,
  RegisterPayload,
} from '@/types'
import { AUTH_API_BASE, createApiClient } from '@/shared/api/api-client'
import { refreshSession } from './auth-session.api'

export { refreshSession }

export type AuthApiErrorCode = 'SESSION_IDLE_EXPIRED' | 'SESSION_ABSOLUTE_EXPIRED'

export class AuthApiError extends Error {
  code?: AuthApiErrorCode
}

const SKIP_REFRESH_RETRY_PATHS = new Set([
  '/login',
  '/register',
  '/refresh',
  '/sendLoginCode',
  '/loginWithCode',
  '/forgotPassword',
  '/resetPassword',
  '/google/callback',
])

const authRequest = createApiClient({
  baseUrl: AUTH_API_BASE,
  skipRefreshRetryPaths: SKIP_REFRESH_RETRY_PATHS,
})

async function request<T>(
  path: string,
  options?: RequestInit,
  canRetryWithRefresh = true,
): Promise<T> {
  try {
    return await authRequest<T>(path, options, canRetryWithRefresh)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication request failed'
    const authError = new AuthApiError(message)
    const code = (error as Error & { code?: string }).code
    if (code === 'SESSION_IDLE_EXPIRED' || code === 'SESSION_ABSOLUTE_EXPIRED')
      authError.code = code
    throw authError
  }
}

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  return await request<AuthUser>('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return await request<AuthUser>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** POST /logout — includes x-csrf-token from csrfToken cookie (required by backend CSRF middleware). */
export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' })
}

export async function getLoginStatus(): Promise<boolean> {
  return await request<boolean>('/status')
}

export async function sendLoginCode(email: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/sendLoginCode/${encodeURIComponent(email)}`, {
    method: 'POST',
  })
}

export async function loginWithCode(email: string, loginCode: string): Promise<AuthUser> {
  return await request<AuthUser>(`/loginWithCode/${encodeURIComponent(email)}`, {
    method: 'POST',
    body: JSON.stringify({ loginCode }),
  })
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return await request<{ message: string }>('/forgotPassword', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(resetToken: string, password: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/resetPassword/${encodeURIComponent(resetToken)}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  })
}

export async function sendVerificationEmail(): Promise<{ message: string }> {
  return await request<{ message: string }>('/sendVerificationEmail', { method: 'POST' })
}

export async function verifyUser(verificationToken: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/verifyUser/${encodeURIComponent(verificationToken)}`, {
    method: 'PATCH',
  })
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return await request<{ message: string }>('/changePassword', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
