import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { resolveAuthRedirect } from '@/app/router/auth-navigation-guard'
import { useAuthStore } from '@/features/auth'

const EmptyView = { template: '<div />' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: EmptyView, meta: {} },
      { path: '/login', name: 'Login', component: EmptyView, meta: { guestOnly: true } },
      {
        path: '/users',
        name: 'Users',
        component: EmptyView,
        meta: { requiresAuth: true, roles: ['admin', 'author'] },
      },
      { path: '/unauthorized', name: 'Unauthorized', component: EmptyView },
    ],
  })
}

function attachProductionGuard(router: ReturnType<typeof createTestRouter>) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const resolved = await resolveAuthRedirect(to, authStore)
    if (resolved === true)
      return
    return resolved
  })
}

describe('router integration (Pinia + resolveAuthRedirect)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects unauthenticated navigation to /users toward Login with redirect query', async () => {
    const router = createTestRouter()
    attachProductionGuard(router)
    const auth = useAuthStore()
    auth.$patch({
      authChecked: true,
      isAuthenticated: false,
      user: null,
      sessionExpiryCode: null,
    })

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.redirect).toBe('/users')
  })

  it('allows admin to reach Users', async () => {
    const router = createTestRouter()
    attachProductionGuard(router)
    const auth = useAuthStore()
    auth.$patch({
      authChecked: true,
      isAuthenticated: true,
      sessionExpiryCode: null,
      user: {
        _id: '1',
        name: 'Admin',
        email: 'a@test.com',
        role: 'admin',
        isVerified: true,
      },
    })

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('Users')
  })

  it('redirects subscriber away from Users to Unauthorized', async () => {
    const router = createTestRouter()
    attachProductionGuard(router)
    const auth = useAuthStore()
    auth.$patch({
      authChecked: true,
      isAuthenticated: true,
      sessionExpiryCode: null,
      user: {
        _id: '2',
        name: 'Sub',
        email: 's@test.com',
        role: 'subscriber',
        isVerified: true,
      },
    })

    await router.push('/users')
    expect(router.currentRoute.value.name).toBe('Unauthorized')
  })

  it('redirects authenticated guest away from Login to Home', async () => {
    const router = createTestRouter()
    attachProductionGuard(router)
    const auth = useAuthStore()
    auth.$patch({
      authChecked: true,
      isAuthenticated: true,
      sessionExpiryCode: null,
      user: {
        _id: '3',
        name: 'U',
        email: 'u@test.com',
        role: 'subscriber',
        isVerified: true,
      },
    })

    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('Home')
  })

  it('calls bootstrapAuth when navigating before authChecked', async () => {
    const router = createTestRouter()
    attachProductionGuard(router)
    const auth = useAuthStore()
    const bootstrap = vi.spyOn(auth, 'bootstrapAuth').mockImplementation(async () => {
      auth.$patch({
        authChecked: true,
        isAuthenticated: false,
        user: null,
        sessionExpiryCode: null,
      })
    })
    auth.$patch({ authChecked: false })

    await router.push('/users')
    expect(bootstrap).toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('Login')
  })
})
