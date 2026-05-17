import type {
  ApiMessageResponse,
  AuthUser,
  UpdateProfilePayload,
  UpgradeUserPayload,
} from '@adaptive-auth/shared-types'
import type { CookieAccess } from '../types.js'
import { createHttpClient } from '../http-client.js'

export interface CreateUsersApiOptions {
  baseUrl: string
  getCookie: CookieAccess['get']
  refreshSession: () => Promise<unknown>
}

export function createUsersApi({ baseUrl, getCookie, refreshSession }: CreateUsersApiOptions) {
  const request = createHttpClient({
    baseUrl,
    getCookie,
    refreshSession,
    skipRefreshRetryPaths: new Set(),
  })

  return {
    getCurrentUser: () => request<AuthUser>('/me'),

    updateUser: (payload: UpdateProfilePayload) =>
      request<AuthUser>('/updateUser', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    getUsers: () => request<AuthUser[]>('/getUsers'),

    deleteUser: (id: string) =>
      request<ApiMessageResponse>(`/${encodeURIComponent(id)}`, { method: 'DELETE' }),

    upgradeUser: (payload: UpgradeUserPayload) =>
      request<ApiMessageResponse>('/upgradeUser', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  }
}

export type UsersApi = ReturnType<typeof createUsersApi>
