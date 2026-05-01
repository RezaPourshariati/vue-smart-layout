import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/features/users/views/UserListView.vue'),
    meta: {
      layout: 'admin',
      requiresAuth: true,
      roles: ['admin', 'author'],
    },
  },
]
