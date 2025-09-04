<template>
  <aside 
    :class="sidebarClasses"
    :style="sidebarStyles"
  >
    <div class="sidebar-content">
      <div 
        v-for="section in config.content" 
        :key="section"
        class="sidebar-section"
      >
        <component 
          :is="getSectionComponent(section)"
          :variant="config.variant"
        />
      </div>
    </div>
    
    <button 
      v-if="config.collapsible"
      @click="toggleCollapse"
      class="collapse-button"
    >
      {{ isCollapsed ? '→' : '←' }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SidebarConfig } from '../types'
import SidebarNavigation from './SidebarNavigation.vue'
import SidebarFilters from './SidebarFilters.vue'
import SidebarInfo from './SidebarInfo.vue'

interface Props {
  config: SidebarConfig
}

const props = defineProps<Props>()

const isCollapsed = ref(false)

const sidebarClasses = computed(() => [
  'layout-sidebar',
  `sidebar-${props.config.position}`,
  `sidebar-${props.config.variant}`,
  {
    'sidebar-collapsed': isCollapsed.value
  }
])

const sidebarStyles = computed(() => ({
  width: isCollapsed.value ? '60px' : (props.config.width || '250px')
}))

const getSectionComponent = (section: string) => {
  const components: Record<string, any> = {
    'navigation': SidebarNavigation,
    'filters': SidebarFilters,
    'info': SidebarInfo
  }
  return components[section] || SidebarInfo
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.layout-sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sidebar-right {
  border-right: none;
  border-left: 1px solid #e0e0e0;
}

.sidebar-content {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.sidebar-collapsed .sidebar-content {
  padding: 0.5rem;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.collapse-button {
  position: absolute;
  top: 1rem;
  right: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-button:hover {
  background: #e9ecef;
}

.sidebar-navigation {
  background: #f8f9fa;
}

.sidebar-filters {
  background: #fff3cd;
}

.sidebar-info {
  background: #d1ecf1;
}
</style>
