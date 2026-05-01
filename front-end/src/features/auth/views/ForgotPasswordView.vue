<script setup lang="ts">
import { ref } from 'vue'
import AuthNotice from '@/components/auth/AuthNotice.vue'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const result = await authStore.forgotPassword(email.value)
    successMessage.value = result.message
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to submit forgot password request'
  }
}
</script>

<template>
  <section class="mx-auto max-w-md py-10">
    <h1 class="mb-4 text-2xl font-semibold">
      Forgot Password
    </h1>
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full rounded border px-3 py-2"
      >
      <button
        type="submit"
        class="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Submitting...' : 'Send Reset Link' }}
      </button>
    </form>
    <AuthNotice
      v-if="successMessage"
      class="mt-4"
      kind="success"
      :message="successMessage"
    />
    <AuthNotice
      v-if="errorMessage"
      class="mt-2"
      kind="error"
      :message="errorMessage"
    />
  </section>
</template>
