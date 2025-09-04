<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutConfig } from './types'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutSidebar from './components/LayoutSidebar.vue'
import LayoutFooter from './components/LayoutFooter.vue'

interface Props {
  config: LayoutConfig
}

const props = defineProps<Props>()

const layoutClasses = computed(() => [
  'base-layout',
  props.config.className,
  {
    'layout-with-sidebar': props.config.sidebar,
    'layout-full-height': props.config.container?.fullHeight
  }
])

const contentClasses = computed(() => [
  'layout-content',
  props.config.container?.className
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
    <LayoutHeader
      v-if="config.header"
      :config="config.header"
    />

    <!-- Main Layout Body -->
    <div class="layout-body">
      <!-- Left Sidebar -->
      <LayoutSidebar
        v-if="config.sidebar?.position === 'left'"
        :config="config.sidebar"
      />

      <!-- Main Content Area -->
      <main :class="contentClasses" :style="contentStyles">
        <div class="content-container">
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
    <LayoutFooter
      v-if="config.footer?.show"
      :config="config.footer"
    />
  </div>
</template>

<style scoped>
.base-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-body {
  display: flex;
  flex: 1;
  position: relative;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.layout-with-sidebar .content-container {
  padding: 1.5rem;
}

.layout-full-height {
  height: 100vh;
}

.layout-full-height .layout-body {
  height: 100%;
}

.layout-full-height .content-container {
  height: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .layout-body {
    flex-direction: column;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
