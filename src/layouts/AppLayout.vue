<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { layoutMap, defaultLayout } from '@/layouts'

const route = useRoute()

// const defaultLayout = 'AppLayoutDefault'

// // Define an explicit mapping for layouts
// const layoutMap = {
//   AppLayoutDefault: defineAsyncComponent(() => import('@/layouts/AppLayoutDefault.vue')),
//   AppLayoutHome: defineAsyncComponent(() => import('@/layouts/AppLayoutHome.vue')),
//   AppLayoutAbout: defineAsyncComponent(() => import('@/layouts/AppLayoutAbout.vue')),
//   AppLayoutContacts: defineAsyncComponent(() => import('@/layouts/AppLayoutContacts.vue')),
// }

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


// watch(
//   () => route.meta.layout,
//   async (layoutName) => {
//     if (!layoutName) {
//       layout.value = AppLayoutDefault
//       return
//     }
//
//     try {
//       const component = await import(`@/layouts/${layoutName}.vue`)
//       layout.value = component.default
//     } catch (e) {
//       layout.value = AppLayoutDefault
//       console.error('Failed to resolve module:', e.message)
//     }
//   },
//   { immediate: true }
// )
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
        <p>Loading layout...</p>
      </template>
    </Suspense>
  </div>
</template>
