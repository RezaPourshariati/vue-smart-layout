import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/features/profile/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      layout: {
        name: 'profile',
        header: {
          type: 'hero',
          color: '#9c27b0',
          showNavigation: true,
          transparent: true,
          title: 'User Profile',
          height: '4rem',
        },
        sidebar: {
          position: 'left',
          width: '300px',
          content: ['info'],
          variant: 'info',
        },
        container: {
          maxWidth: '1000px',
          padding: '1.5rem',
        },
        footer: {
          show: true,
          variant: 'minimal',
        },
      },
    },
  },
]
