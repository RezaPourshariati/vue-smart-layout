import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { resolveAuthRedirect } from '@/app/router/auth-navigation-guard'
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
  const resolved = await resolveAuthRedirect(to, authStore)
  if (resolved === true)
    return
  return resolved
})

export default router
