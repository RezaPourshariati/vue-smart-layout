import type { AuthUser, UpdateProfilePayload, UpgradeUserPayload } from '@/types'
import { createApiClient, USERS_API_BASE } from '@/shared/api/api-client'

const request = createApiClient({
  baseUrl: USERS_API_BASE,
  skipRefreshRetryPaths: new Set(),
})

export async function getCurrentUser(): Promise<AuthUser> {
  return await request<AuthUser>('/me')
}

export async function updateUser(payload: UpdateProfilePayload): Promise<AuthUser> {
  return await request<AuthUser>('/updateUser', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function getUsers(): Promise<AuthUser[]> {
  return await request<AuthUser[]>('/getUsers')
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function upgradeUser(payload: UpgradeUserPayload): Promise<{ message: string }> {
  return await request<{ message: string }>('/upgradeUser', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
