import type { AuthUser } from '@adaptive-auth/shared-types'
import type { AuthApiError, AuthApiErrorCode } from '../errors.js'
import { isAuthApiErrorCode } from '../errors.js'

export interface BootstrapSessionDeps {
  refreshSession: () => Promise<unknown>
  getLoginStatus: () => Promise<boolean>
  getCurrentUser: () => Promise<AuthUser>
}

export interface BootstrapSessionResult {
  user: AuthUser | null
  sessionExpiryCode: AuthApiErrorCode | null
}

export async function bootstrapSession({
  refreshSession,
  getLoginStatus,
  getCurrentUser,
}: BootstrapSessionDeps): Promise<BootstrapSessionResult> {
  try {
    try {
      await refreshSession()
      const user = await getCurrentUser()
      return { user, sessionExpiryCode: null }
    }
    catch (error) {
      const authError = error as AuthApiError
      if (authError?.code && isAuthApiErrorCode(authError.code))
        return { user: null, sessionExpiryCode: authError.code }
      if (authError?.message?.includes('suspended'))
        return { user: null, sessionExpiryCode: 'ACCOUNT_SUSPENDED' }
    }

    const isLoggedIn = await getLoginStatus()
    if (isLoggedIn) {
      const user = await getCurrentUser()
      return { user, sessionExpiryCode: null }
    }

    return { user: null, sessionExpiryCode: null }
  }
  catch {
    return { user: null, sessionExpiryCode: null }
  }
}
