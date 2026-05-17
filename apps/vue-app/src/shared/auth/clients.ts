import { createBrowserAuthClients } from '@adaptive-auth/shared-auth/browser'
import { resolveApiRoot } from '@/shared/api/env'

const { auth, users, refreshSession } = createBrowserAuthClients({
  apiRoot: resolveApiRoot(),
})

export { auth, refreshSession, users }

export const API_ROOT = resolveApiRoot()
export const AUTH_API_BASE = `${API_ROOT}/api/auth`
export const USERS_API_BASE = `${API_ROOT}/api/users`
