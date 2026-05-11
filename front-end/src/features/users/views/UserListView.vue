<script setup lang="ts">
import type { UserRole } from '@/types'
import { onMounted, ref } from 'vue'
import AuthNotice from '@/components/auth/AuthNotice.vue'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()
const message = ref('')
const errorMessage = ref('')
const roleDraft = ref<Record<string, UserRole>>({})

const roleOptions: { label: string, value: UserRole }[] = [
  { label: 'subscriber', value: 'subscriber' },
  { label: 'author', value: 'author' },
  { label: 'admin', value: 'admin' },
  { label: 'suspended', value: 'suspended' },
]

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

    <DataTable
      :value="authStore.users"
      size="small"
      striped-rows
      show-gridlines
      data-key="_id"
      class="text-sm"
      table-style="min-width: 50rem"
    >
      <template #empty>
        <span class="text-gray-500">No users found.</span>
      </template>
      <Column
        field="name"
        header="Name"
        :sortable="true"
      />
      <Column
        field="email"
        header="Email"
        :sortable="true"
      />
      <Column
        header="Role"
        :sortable="false"
      >
        <template #body="{ data }">
          <Select
            v-model="roleDraft[data._id]"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="Role"
            class="w-full min-w-40 md:w-56"
          />
        </template>
      </Column>
      <Column
        header="Actions"
        :exportable="false"
        :sortable="false"
      >
        <template #body="{ data }">
          <div class="flex flex-wrap gap-2">
            <Button
              label="Update Role"
              size="small"
              @click="handleRoleUpdate(data._id)"
            />
            <Button
              label="Delete"
              severity="danger"
              size="small"
              @click="handleDelete(data._id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </section>
</template>
