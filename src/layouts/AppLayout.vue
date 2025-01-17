<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { layoutMap, defaultLayout } from '@/layouts'

const route = useRoute()

// Computed property to determine the active layout
const layout = computed(() => {
  const layoutName = route.meta.layout as string || defaultLayout
  if (layoutMap[layoutName]) {
    return layoutMap[layoutName]
  } else {
    console.warn(`Layout "${layoutName}" not found. Falling back to default layout.`)
    return layoutMap[defaultLayout]
  }
})
</script>

<template>
  <div>
    <Suspense>
      <template #default>
        <component :is="layout">
          <slot />
        </component>
      </template>
      <template #fallback>
        <h4>Loading layout...</h4>
      </template>
    </Suspense>
  </div>
</template>
