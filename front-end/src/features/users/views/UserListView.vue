<script setup lang="ts">
import type { UserRole } from '@/types'
import { onMounted, ref } from 'vue'
import AuthNotice from '@/components/auth/AuthNotice.vue'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()
const message = ref('')
const errorMessage = ref('')
const roleDraft = ref<Record<string, UserRole>>({})

function syncRoleDraft() {
  roleDraft.value = Object.fromEntries(authStore.users.map(user => [user._id, user.role]))
}

onMounted(async () => {
  try {
    await authStore.getUsers()
    syncRoleDraft()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load users'
  }
})

async function handleDelete(id: string) {
  message.value = ''
  errorMessage.value = ''
  try {
    const result = await authStore.deleteUser(id)
    message.value = result.message
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete user'
  }
}

async function handleRoleUpdate(id: string) {
  message.value = ''
  errorMessage.value = ''
  const nextRole = roleDraft.value[id]
  if (!nextRole)
    return
  try {
    const result = await authStore.upgradeUser({ id, role: nextRole })
    message.value = result.message
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update user role'
  }
}
</script>

<template>
  <section class="py-8">
    <h1 class="mb-6 text-2xl font-semibold">
      User Management
    </h1>
    <AuthNotice
      v-if="message"
      class="mb-4"
      kind="success"
      :message="message"
    />
    <AuthNotice
      v-if="errorMessage"
      class="mb-4"
      kind="error"
      :message="errorMessage"
    />

    <div class="overflow-x-auto rounded border">
      <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 font-medium text-gray-700">
              Name
            </th>
            <th class="px-4 py-3 font-medium text-gray-700">
              Email
            </th>
            <th class="px-4 py-3 font-medium text-gray-700">
              Role
            </th>
            <th class="px-4 py-3 font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="user in authStore.users"
            :key="user._id"
          >
            <td class="px-4 py-3">
              {{ user.name }}
            </td>
            <td class="px-4 py-3">
              {{ user.email }}
            </td>
            <td class="px-4 py-3">
              <select
                v-model="roleDraft[user._id]"
                class="rounded border px-2 py-1"
              >
                <option value="subscriber">
                  subscriber
                </option>
                <option value="author">
                  author
                </option>
                <option value="admin">
                  admin
                </option>
                <option value="suspended">
                  suspended
                </option>
              </select>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button
                  class="rounded bg-blue-600 px-3 py-1 text-white"
                  @click="handleRoleUpdate(user._id)"
                >
                  Update Role
                </button>
                <button
                  class="rounded bg-red-600 px-3 py-1 text-white"
                  @click="handleDelete(user._id)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="authStore.users.length === 0">
            <td
              class="px-4 py-6 text-center text-gray-500"
              colspan="4"
            >
              No users found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
