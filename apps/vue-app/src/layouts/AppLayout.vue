<script setup lang="ts">
import type { LayoutConfig } from '@/layouts'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveLayout } from '@/layouts'

const route = useRoute()

const layoutInfo = computed(() => {
  const layoutIdentifier = route.meta.layout as string | LayoutConfig | undefined
  return resolveLayout(layoutIdentifier)
})

const layout = computed(() => layoutInfo.value.component)
const layoutConfig = computed(() => layoutInfo.value.config)
</script>

<template>
  <div>
    <component
      :is="layout"
      :config="layoutConfig"
    >
      <slot />
    </component>
  </div>
</template>
