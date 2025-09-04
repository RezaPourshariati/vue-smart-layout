import type { LayoutConfig } from './types'

// Example configurations showing different use cases

// 1. E-commerce Product Page
export const ecommerceProductLayout: LayoutConfig = {
  name: 'ecommerce-product',
  header: {
    type: 'minimal',
    showNavigation: true,
    height: '4rem'
  },
  sidebar: {
    position: 'right',
    width: '350px',
    content: ['filters', 'info'],
    variant: 'filters'
  },
  container: {
    maxWidth: '1400px',
    padding: '1rem'
  },
  footer: {
    show: true,
    variant: 'extended'
  }
}

// 2. Blog Post Layout
export const blogPostLayout: LayoutConfig = {
  name: 'blog-post',
  header: {
    type: 'standard',
    showNavigation: true,
    height: '5rem'
  },
  sidebar: {
    position: 'right',
    width: '280px',
    content: ['info'],
    variant: 'info'
  },
  container: {
    maxWidth: '800px',
    centered: true,
    padding: '2rem'
  },
  footer: {
    show: true,
    variant: 'standard'
  }
}

// 3. Full-screen Application (like IDE)
export const fullscreenAppLayout: LayoutConfig = {
  name: 'fullscreen-app',
  header: {
    type: 'minimal',
    showNavigation: false,
    height: '2.5rem'
  },
  sidebar: {
    position: 'left',
    width: '200px',
    collapsible: true,
    content: ['navigation'],
    variant: 'navigation'
  },
  container: {
    fullHeight: true,
    padding: '0'
  },
  footer: {
    show: false
  }
}

// 4. Documentation Layout
export const docsLayout: LayoutConfig = {
  name: 'documentation',
  header: {
    type: 'standard',
    showNavigation: true,
    height: '4rem'
  },
  sidebar: {
    position: 'left',
    width: '300px',
    content: ['navigation'],
    variant: 'navigation'
  },
  container: {
    maxWidth: '1200px',
    padding: '2rem'
  },
  footer: {
    show: true,
    variant: 'minimal'
  }
}

// 5. Settings Page
export const settingsLayout: LayoutConfig = {
  name: 'settings',
  header: {
    type: 'minimal',
    showNavigation: true,
    title: 'Settings',
    height: '3.5rem'
  },
  sidebar: {
    position: 'left',
    width: '250px',
    content: ['navigation'],
    variant: 'navigation'
  },
  container: {
    maxWidth: '1000px',
    padding: '1.5rem'
  },
  footer: {
    show: false
  }
}

// 6. Marketing Landing Page
export const marketingLayout: LayoutConfig = {
  name: 'marketing',
  header: {
    type: 'hero',
    transparent: true,
    showNavigation: true,
    height: '100vh'
  },
  container: {
    padding: '0',
    className: 'marketing-sections'
  },
  footer: {
    show: true,
    variant: 'extended'
  }
}

// Usage Examples for Router Configuration
export const routerExamples = {
  // Using preset
  simpleRoute: {
    path: '/simple',
    component: () => import('@/views/Home.vue'),
    meta: { layout: 'simple' }
  },

  // Using custom configuration
  customRoute: {
    path: '/custom',
    component: () => import('@/views/About.vue'),
    meta: { layout: blogPostLayout }
  },

  // Inline configuration
  inlineRoute: {
    path: '/inline',
    component: () => import('@/views/Contacts.vue'),
    meta: {
      layout: {
        name: 'inline-custom',
        header: {
          type: 'hero',
          color: '#ff5722',
          showNavigation: true,
          title: 'Custom Page'
        },
        container: {
          maxWidth: '900px',
          centered: true
        },
        footer: { show: true, variant: 'minimal' }
      }
    }
  }
}

// Helper functions for dynamic layouts
export const createDynamicLayout = (theme: 'light' | 'dark', hasAuth: boolean): LayoutConfig => ({
  name: `dynamic-${theme}-${hasAuth ? 'auth' : 'guest'}`,
  header: {
    type: 'standard',
    color: theme === 'dark' ? '#333' : '#fff',
    showNavigation: hasAuth,
    height: '4rem'
  },
  sidebar: hasAuth ? {
    position: 'left',
    width: '250px',
    content: ['navigation'],
    variant: 'navigation'
  } : undefined,
  container: {
    maxWidth: '1200px',
    padding: '2rem'
  },
  footer: {
    show: true,
    variant: 'standard'
  }
})
