import type { LayoutConfig, ResolvedLayouts } from './types'
import { defineAsyncComponent } from 'vue'
import { getLayoutConfig, layoutPresets } from './presets'

export const defaultLayout: string = 'simple'

// Composable layout system
export const BaseLayout = defineAsyncComponent(() => import('./BaseLayout.vue'))

// Helper function to resolve layout configuration
export function resolveLayout(layoutIdentifier: string | LayoutConfig | undefined): ResolvedLayouts {
  // If no layout specified, use default
  if (!layoutIdentifier) {
    return {
      component: BaseLayout,
      config: getLayoutConfig(defaultLayout),
    }
  }

  // If layout is a configuration object, use BaseLayout with config
  if (typeof layoutIdentifier === 'object') {
    return {
      component: BaseLayout,
      config: layoutIdentifier,
    }
  }

  // If layout is a preset name, use BaseLayout with preset config
  if (layoutPresets[layoutIdentifier]) {
    return {
      component: BaseLayout,
      config: getLayoutConfig(layoutIdentifier),
    }
  }

  // Fallback to default for unknown layout names
  console.warn(`Layout "${layoutIdentifier}" not found. Using default layout.`)
  return {
    component: BaseLayout,
    config: getLayoutConfig(defaultLayout),
  }
}

export { getLayoutConfig, layoutPresets } from './presets'
// Export types and presets
export type { LayoutConfig } from './types'
