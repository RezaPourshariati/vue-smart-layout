<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthNotice from '@/components/auth/AuthNotice.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('admin@smartlayout.dev')
const password = ref('password123')
const errorMessage = ref('')

const redirectTo = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' ? redirect : '/'
})

async function handleLogin() {
  errorMessage.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    await router.push(redirectTo.value)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    errorMessage.value = message
    if (message.includes('New browser or device detected')) {
      await authStore.sendLoginCode(email.value)
      await router.push({ name: 'LoginWithCode', query: { email: email.value } })
    }
  }
}
</script>

<template>
  <section class="mx-auto max-w-md py-10">
    <h1 class="mb-4 text-2xl font-semibold">
      Login
    </h1>
    <p class="mb-6 text-slate-600">
      Sign in to access protected Smart Layout routes.
    </p>
    <p class="mb-6 text-xs text-slate-500">
      Test accounts: `admin@smartlayout.dev` / `password123`
    </p>

    <form
      class="space-y-4"
      @submit.prevent="handleLogin"
    >
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full rounded border px-3 py-2"
      >
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full rounded border px-3 py-2"
      >
      <button
        type="submit"
        class="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <AuthNotice
      v-if="errorMessage"
      class="mt-4"
      kind="error"
      :message="errorMessage"
    />
    <p class="mt-4 text-sm">
      <RouterLink
        to="/forgot-password"
        class="text-blue-600 hover:underline"
      >
        Forgot password?
      </RouterLink>
    </p>
  </section>
</template>
