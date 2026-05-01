import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: {
      layout: 'admin',
      requiresAuth: true,
      roles: ['admin'],
    },
  },
]
