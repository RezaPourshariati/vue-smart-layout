import { createAuthApi } from './auth/api.js'
import { browserCookieAccess, getBrowserCookie } from './cookies/browser.js'
import { createRefreshSession } from './refresh.js'
import { createUsersApi } from './users/api.js'

export interface CreateBrowserAuthClientsOptions {
  apiRoot: string
  refreshLockName?: string
}

function normalizeApiRoot(apiRoot: string): string {
  return apiRoot.replace(/\/$/, '')
}

export function createBrowserAuthClients({
  apiRoot,
  refreshLockName,
}: CreateBrowserAuthClientsOptions) {
  const root = normalizeApiRoot(apiRoot)
  const authApiBase = `${root}/api/auth`
  const usersApiBase = `${root}/api/users`
  const getCookie = getBrowserCookie

  const refreshSession = createRefreshSession({
    authApiBase,
    getCookie,
    lockName: refreshLockName,
  })

  const auth = createAuthApi({ baseUrl: authApiBase, getCookie, refreshSession })
  const users = createUsersApi({ baseUrl: usersApiBase, getCookie, refreshSession })

  return { auth, users, refreshSession }
}

export { browserCookieAccess, getBrowserCookie }
