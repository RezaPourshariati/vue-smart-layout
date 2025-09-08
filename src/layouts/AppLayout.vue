<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {resolveLayout} from '@/layouts'
import type {LayoutConfig} from '@/layouts'
import {watch} from 'vue'

const route = useRoute()

// Computed property to determine the active layout and configuration
const layoutInfo = computed(() => {
  const layoutIdentifier = route.meta.layout as string | LayoutConfig | undefined
  return resolveLayout(layoutIdentifier)
})

const layout = computed(() => layoutInfo.value.component)
const layoutConfig = computed(() => layoutInfo.value.config)

watch(() => layoutInfo.value, (newVal) => {
  console.log('component ----->', newVal.component)
  console.log('config ----->', newVal.config)
})
</script>

<template>
  <div>
    <Suspense>
      <template #default>
        <component
          :is="layout"
          :config="layoutConfig"
        >
          <slot/>
        </component>
      </template>
      <template #fallback>
        <h4>Loading layout...</h4>
      </template>
    </Suspense>
  </div>
</template>
