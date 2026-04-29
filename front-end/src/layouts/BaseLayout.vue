<script setup lang="ts">
import type { LayoutConfig } from './types'
import { computed } from 'vue'
import LayoutFooter from './components/LayoutFooter.vue'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutSidebar from './components/LayoutSidebar.vue'

interface Props {
  config: LayoutConfig
}

const props = defineProps<Props>()

const layoutClasses = computed(() => [
  'min-h-screen flex flex-col',
  props.config.className,
  {
    'h-screen': props.config.container?.fullHeight,
  },
])

const contentClasses = computed(() => [
  'mx-auto my-0 flex flex-1 flex-col overflow-hidden',
  props.config.container?.className,
])

const bodyClasses = computed(() => [
  'relative flex flex-1 max-md:flex-col',
  {
    'h-full': props.config.container?.fullHeight,
  },
])

const contentContainerClasses = computed(() => [
  'flex-1 overflow-y-auto content-reveal max-md:p-4',
  props.config.sidebar ? 'p-6' : 'p-8',
  {
    'h-full': props.config.container?.fullHeight,
  },
])

const contentStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.config.container?.maxWidth) {
    styles.maxWidth = props.config.container.maxWidth
  }

  if (props.config.container?.padding) {
    styles.padding = props.config.container.padding
  }

  return styles
})
</script>

<template>
  <div :class="layoutClasses">
    <!-- Header -->
    <Transition
      name="layout-section"
      appear
    >
      <LayoutHeader
        v-if="config.header"
        :config="config.header"
      />
    </Transition>

    <!-- Main Layout Body -->
    <div :class="bodyClasses">
      <!-- Left Sidebar -->
      <LayoutSidebar
        v-if="config.sidebar?.position === 'left'"
        :config="config.sidebar"
      />

      <!-- Main Content Area -->
      <main
        :class="contentClasses"
        :style="contentStyles"
      >
        <div :class="contentContainerClasses">
          <slot />
        </div>
      </main>

      <!-- Right Sidebar -->
      <LayoutSidebar
        v-if="config.sidebar?.position === 'right'"
        :config="config.sidebar"
      />
    </div>

    <!-- Footer -->
    <Transition
      name="layout-section"
      appear
    >
      <LayoutFooter
        v-if="config.footer?.show"
        :config="config.footer"
      />
    </Transition>
  </div>
</template>

<style scoped>
.content-reveal {
  animation: contentFadeIn 460ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}

.layout-section-enter-active,
.layout-section-leave-active {
  transition:
    opacity 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.layout-section-enter-from,
.layout-section-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
