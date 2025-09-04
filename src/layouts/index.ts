import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'
import type { LayoutConfig } from './types'
import { getLayoutConfig, layoutPresets } from './presets'

export const defaultLayout: string = 'simple'

// Composable layout system
export const BaseLayout = defineAsyncComponent(() => import('./BaseLayout.vue'))

// Helper function to resolve layout configuration
export const resolveLayout = (layoutIdentifier: string | LayoutConfig | undefined): { component: Component; config: LayoutConfig } => {
  // If no layout specified, use default
  if (!layoutIdentifier) {
    return {
      component: BaseLayout,
      config: getLayoutConfig(defaultLayout)
    }
  }

  // If layout is a configuration object, use BaseLayout with config
  if (typeof layoutIdentifier === 'object') {
    return {
      component: BaseLayout,
      config: layoutIdentifier
    }
  }

  // If layout is a preset name, use BaseLayout with preset config
  if (layoutPresets[layoutIdentifier]) {
    return {
      component: BaseLayout,
      config: getLayoutConfig(layoutIdentifier)
    }
  }

  // Fallback to default for unknown layout names
  console.warn(`Layout "${layoutIdentifier}" not found. Using default layout.`)
  return {
    component: BaseLayout,
    config: getLayoutConfig(defaultLayout)
  }
}

// Export types and presets
export type { LayoutConfig } from './types'
export { getLayoutConfig, layoutPresets } from './presets'

