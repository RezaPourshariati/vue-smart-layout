import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

/** Minimal surface used by `resolveAuthRedirect` for tests and production. */
export interface AuthStoreForGuard {
  authChecked: boolean
  isAuthenticated: boolean
  sessionExpiryCode: string | null
  hasRole: (role: string) => boolean
  bootstrapAuth: () => Promise<void>
}

/**
 * Router navigation resolution for auth (guest-only, requiresAuth, roles).
 * Kept pure of Vue Router registration so it can be unit-tested without mounting the app.
 */
export async function resolveAuthRedirect(
  to: RouteLocationNormalized,
  authStore: AuthStoreForGuard,
): Promise<RouteLocationRaw | true> {
  if (!authStore.authChecked)
    await authStore.bootstrapAuth()

  if (to.meta.guestOnly && authStore.isAuthenticated)
    return { name: 'Home' }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    const query: Record<string, string> = { redirect: to.fullPath }
    if (authStore.sessionExpiryCode)
      query.session = authStore.sessionExpiryCode
    return { name: 'Login', query }
  }

  const roles = to.meta.roles
  if (Array.isArray(roles) && roles.length > 0) {
    const roleList = roles as string[]
    const hasAnyRole = roleList.some(role => authStore.hasRole(role))
    if (!hasAnyRole)
      return { name: 'Unauthorized' }
  }

  return true
}
