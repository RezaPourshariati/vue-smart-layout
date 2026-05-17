import type {
  ApiMessageResponse,
  AuthCredentials,
  AuthUser,
  ChangePasswordPayload,
  RegisterPayload,
} from '@adaptive-auth/shared-types'
import type { HttpRequest } from '../http-client.js'
import type { CookieAccess } from '../types.js'
import { toAuthApiError } from '../errors.js'
import { createHttpClient } from '../http-client.js'
import { AUTH_SKIP_REFRESH_RETRY_PATHS } from './paths.js'

export interface CreateAuthApiOptions {
  baseUrl: string
  getCookie: CookieAccess['get']
  refreshSession: () => Promise<unknown>
}

function wrapAuthRequest(request: HttpRequest) {
  return async function authRequest<T>(
    path: string,
    options?: RequestInit,
    canRetryWithRefresh = true,
  ): Promise<T> {
    try {
      return await request<T>(path, options, canRetryWithRefresh)
    }
    catch (error) {
      throw toAuthApiError(error)
    }
  }
}

export function createAuthApi({ baseUrl, getCookie, refreshSession }: CreateAuthApiOptions) {
  const request = wrapAuthRequest(createHttpClient({
    baseUrl,
    getCookie,
    refreshSession,
    skipRefreshRetryPaths: AUTH_SKIP_REFRESH_RETRY_PATHS,
  }))

  return {
    login: (credentials: AuthCredentials) =>
      request<AuthUser>('/login', { method: 'POST', body: JSON.stringify(credentials) }),

    register: (payload: RegisterPayload) =>
      request<AuthUser>('/register', { method: 'POST', body: JSON.stringify(payload) }),

    logout: () => request<void>('/logout', { method: 'POST' }),

    getLoginStatus: () => request<boolean>('/status'),

    sendLoginCode: (email: string) =>
      request<ApiMessageResponse>(`/sendLoginCode/${encodeURIComponent(email)}`, { method: 'POST' }),

    loginWithCode: (email: string, loginCode: string) =>
      request<AuthUser>(`/loginWithCode/${encodeURIComponent(email)}`, {
        method: 'POST',
        body: JSON.stringify({ loginCode }),
      }),

    forgotPassword: (email: string) =>
      request<ApiMessageResponse>('/forgotPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (resetToken: string, password: string) =>
      request<ApiMessageResponse>(`/resetPassword/${encodeURIComponent(resetToken)}`, {
        method: 'PATCH',
        body: JSON.stringify({ password }),
      }),

    sendVerificationEmail: () =>
      request<ApiMessageResponse>('/sendVerificationEmail', { method: 'POST' }),

    verifyUser: (verificationToken: string) =>
      request<ApiMessageResponse>(`/verifyUser/${encodeURIComponent(verificationToken)}`, {
        method: 'PATCH',
      }),

    changePassword: (payload: ChangePasswordPayload) =>
      request<ApiMessageResponse>('/changePassword', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
