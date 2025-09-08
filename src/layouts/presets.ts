import type {LayoutConfig, LayoutPreset} from './types'

// Predefined layout configurations for common use cases
export const layoutPresets: Record<string, LayoutPreset> = {
  // Simple page layout (like your current AppLayoutDefault)
  simple: {
    name: 'Simple Layout',
    description: 'Minimal layout with just content',
    config: {
      name: 'simple',
      header: {
        type: 'minimal',
        showNavigation: true,
        height: '3rem'
      },
      container: {
        maxWidth: '1200px',
        centered: true,
        padding: '2rem'
      },
      footer: {
        show: true,
        variant: 'minimal'
      }
    }
  },

  // Home page layout (like your current AppLayoutHome)
  home: {
    name: 'Home Layout',
    description: 'Hero header with centered content',
    config: {
      name: 'home',
      header: {
        type: 'hero',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        showNavigation: true,
        title: 'Welcome Home',
        height: '8rem'
      },
      container: {
        maxWidth: '1100px',
        centered: true,
        padding: '2rem',
        className: 'home-container'
      },
      footer: {
        show: true,
        variant: 'standard'
      }
    }
  },

  // About page layout (like your current AppLayoutAbout)
  about: {
    name: 'About Layout',
    description: 'Standard header with blue theme',
    config: {
      name: 'about',
      header: {
        type: 'standard',
        color: '#2196F3',
        showNavigation: true,
        height: '5rem'
      },
      container: {
        maxWidth: '1200px',
        centered: true,
        padding: '2rem'
      },
      footer: {
        show: true,
        variant: 'standard'
      }
    }
  },

  // Contact page layout (like your current AppLayoutContacts)
  contacts: {
    name: 'Contacts Layout',
    description: 'Standard header with red theme',
    config: {
      name: 'contacts',
      header: {
        type: 'standard',
        color: '#f44336',
        showNavigation: true,
        height: '5rem'
      },
      container: {
        maxWidth: '1200px',
        centered: true,
        padding: '2rem'
      },
      footer: {
        show: true,
        variant: 'extended'
      }
    }
  },

  // Dashboard layout with sidebar
  dashboard: {
    name: 'Dashboard Layout',
    description: 'Full dashboard with navigation sidebar',
    config: {
      name: 'dashboard',
      header: {
        type: 'minimal',
        showNavigation: false,
        title: 'Dashboard',
        height: '4rem'
      },
      sidebar: {
        position: 'left',
        width: '250px',
        collapsible: true,
        content: ['navigation'],
        variant: 'navigation'
      },
      container: {
        fullHeight: true,
        padding: '1.5rem'
      },
      footer: {
        show: false
      }
    }
  },

  // Admin layout with filters
  admin: {
    name: 'Admin Layout',
    description: 'Admin interface with filters sidebar',
    config: {
      name: 'admin',
      header: {
        type: 'standard',
        color: '#6c757d',
        showNavigation: true,
        title: 'Admin Panel',
        height: '4rem'
      },
      sidebar: {
        position: 'left',
        width: '280px',
        collapsible: true,
        content: ['navigation', 'filters'],
        variant: 'filters'
      },
      container: {
        fullHeight: true,
        padding: '1rem'
      },
      footer: {
        show: true,
        variant: 'minimal'
      }
    }
  },

  // Full-width layout for landing pages
  landing: {
    name: 'Landing Layout',
    description: 'Full-width layout for marketing pages',
    config: {
      name: 'landing',
      header: {
        type: 'hero',
        transparent: true,
        showNavigation: true,
        height: '6rem'
      },
      container: {
        padding: '0',
        className: 'landing-container'
      },
      footer: {
        show: true,
        variant: 'extended'
      }
    }
  }
}

// Helper function to get layout config by name
export const getLayoutConfig = (layoutName: string): LayoutConfig => {
  const preset = layoutPresets[layoutName]
  if (preset)
    return preset.config

  // Fallback to simple layout
  console.warn(`Layout preset "${layoutName}" not found. Using simple layout.`)
  return layoutPresets.simple.config
}

// Helper function to create custom layout config
export const createLayoutConfig = (overrides: Partial<LayoutConfig>): LayoutConfig => {
  const baseConfig = layoutPresets.simple.config
  return {
    ...baseConfig,
    ...overrides,
    header: overrides.header ? {...baseConfig.header, ...overrides.header} : baseConfig.header,
    sidebar: overrides.sidebar ? {...overrides.sidebar} : undefined,
    container: overrides.container ? {...baseConfig.container, ...overrides.container} : baseConfig.container,
    footer: overrides.footer ? {...baseConfig.footer, ...overrides.footer} : baseConfig.footer
  }
}
