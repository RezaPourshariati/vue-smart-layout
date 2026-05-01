import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import { authRoutes } from '@/features/auth/routes'
import { dashboardRoutes } from '@/features/dashboard/routes'
import { profileRoutes } from '@/features/profile/routes'
import { publicRoutes } from '@/features/public/routes'
import { userRoutes } from '@/features/users/routes'

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...userRoutes,
  ...publicRoutes,
  ...dashboardRoutes,
  ...profileRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.authChecked)
    await authStore.bootstrapAuth()

  if (to.meta.guestOnly && authStore.isAuthenticated)
    return { name: 'Home' }

  if (to.meta.requiresAuth && !authStore.isAuthenticated)
    return { name: 'Login', query: { redirect: to.fullPath } }

  if (to.meta.roles?.length) {
    const hasAnyRole = to.meta.roles.some(role => authStore.hasRole(role))
    if (!hasAnyRole)
      return { name: 'Unauthorized' }
  }
})

export default router
