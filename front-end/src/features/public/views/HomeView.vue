<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()
const router = useRouter()

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <section class="mx-auto max-w-lg py-10">
    <h1 class="mb-2 text-3xl font-bold">
      Smart Layout Authentication
    </h1>
    <p class="mb-6 text-gray-600">
      Advanced auth flow inspired by the reference app, adapted to Vue + Pinia and your layout architecture.
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-if="!authStore.isAuthenticated"
        class="rounded border border-gray-200 bg-white p-4 shadow-sm"
      >
        <Button
          label="Go to Login"
          severity="primary"
          class="w-full"
          @click="goTo('/login')"
        />
      </div>

      <div
        v-if="!authStore.isAuthenticated"
        class="rounded border border-gray-200 bg-white p-4 shadow-sm"
      >
        <Button
          label="Go to Register"
          severity="secondary"
          class="w-full"
          @click="goTo('/register')"
        />
      </div>

      <div
        v-if="authStore.isAuthenticated"
        class="rounded border border-gray-200 bg-white p-4 shadow-sm hover:border-emerald-300"
      >
        <h3 class="mb-2 font-semibold">
          Profile & Security
        </h3>
        <p class="mb-4 text-sm text-gray-600">
          Update profile, send verification email, and change password.
        </p>
        <Button
          label="Go to Profile"
          severity="secondary"
          class="w-full"
          @click="goTo('/profile')"
        />
      </div>

      <div
        v-if="authStore.isAuthenticated"
        class="rounded border border-gray-200 bg-white p-4 shadow-sm hover:border-emerald-300"
      >
        <h3 class="mb-2 font-semibold">
          Dashboard
        </h3>
        <p class="mb-4 text-sm text-gray-600">
          Protected workspace for authenticated users.
        </p>
        <Button
          label="Go to Dashboard"
          severity="secondary"
          class="w-full"
          @click="goTo('/dashboard')"
        />
      </div>
    </div>
  </section>
</template>
