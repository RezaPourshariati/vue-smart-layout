import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/login-with-code',
    name: 'LoginWithCode',
    component: () => import('@/views/auth/LoginWithCode.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/reset-password/:resetToken',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/verify/:verificationToken',
    name: 'VerifyEmail',
    component: () => import('@/views/auth/VerifyEmail.vue'),
    meta: {
      layout: 'simple',
    },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/auth/ChangePassword.vue'),
    meta: {
      layout: 'simple',
      requiresAuth: true,
    },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/UserList.vue'),
    meta: {
      layout: 'admin',
      requiresAuth: true,
      roles: ['admin', 'author'],
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/Unauthorized.vue'),
    meta: {
      layout: 'simple',
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      layout: 'home', // Using new preset system
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      layout: 'about', // Using new preset system
    },
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/views/Contacts.vue'),
    meta: {
      layout: 'contacts', // Using new preset system
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      layout: 'dashboard', // New dashboard layout
      requiresAuth: true,
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      layout: 'admin', // New admin layout with filters
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('@/views/Landing.vue'),
    meta: {
      layout: 'landing', // New landing layout
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      // Custom layout configuration
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
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/Home.vue'),
    // No layout specified - will use default 'simple' layout
  },
  // {
  //   path: '/wow',
  //   name: 'Wow',
  //   component: () => import('@/views/Wow.vue'),
  //   // meta: {
  //   //   layout: 'wow',
  //   // },
  //   // No layout specified - will use default 'simple' layout
  // },
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
