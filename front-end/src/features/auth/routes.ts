import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterView.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/login-with-code',
    name: 'LoginWithCode',
    component: () => import('@/features/auth/views/LoginWithCodeView.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/views/ForgotPasswordView.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/reset-password/:resetToken',
    name: 'ResetPassword',
    component: () => import('@/features/auth/views/ResetPasswordView.vue'),
    meta: {
      layout: 'simple',
      guestOnly: true,
    },
  },
  {
    path: '/verify/:verificationToken',
    name: 'VerifyEmail',
    component: () => import('@/features/auth/views/VerifyEmailView.vue'),
    meta: {
      layout: 'simple',
    },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/features/auth/views/ChangePasswordView.vue'),
    meta: {
      layout: 'simple',
      requiresAuth: true,
    },
  },
]
