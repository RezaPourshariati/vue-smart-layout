<script setup lang="ts">
import AuthNotice from '@/shared/components/feedback/AuthNotice.vue'

interface Props {
  kind: 'success' | 'error' | 'info'
  message: string
}

defineProps<Props>()
</script>

<template>
  <AuthNotice v-bind="$props" />
</template>
