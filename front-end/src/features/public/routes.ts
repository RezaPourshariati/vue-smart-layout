import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/features/public/views/UnauthorizedView.vue'),
    meta: {
      layout: 'simple',
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/features/public/views/HomeView.vue'),
    meta: {
      layout: 'home',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/features/public/views/AboutView.vue'),
    meta: {
      layout: 'about',
    },
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/features/public/views/ContactsView.vue'),
    meta: {
      layout: 'contacts',
    },
  },
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('@/features/public/views/LandingView.vue'),
    meta: {
      layout: 'landing',
    },
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/features/public/views/HomeView.vue'),
  },
]
