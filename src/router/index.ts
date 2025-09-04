import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      layout: 'home'  // Using new preset system
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      layout: 'about'  // Using new preset system
    }
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('@/views/Contacts.vue'),
    meta: {
      layout: 'contacts'  // Using new preset system
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      layout: 'dashboard'  // New dashboard layout
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      layout: 'admin'  // New admin layout with filters
    }
  },
  {
    path: '/landing',
    name: 'Landing',
    component: () => import('@/views/Landing.vue'),
    meta: {
      layout: 'landing'  // New landing layout
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      // Custom layout configuration
      layout: {
        name: 'profile',
        header: {
          type: 'standard',
          color: '#9c27b0',
          showNavigation: true,
          title: 'User Profile',
          height: '4rem'
        },
        sidebar: {
          position: 'right',
          width: '300px',
          content: ['info'],
          variant: 'info'
        },
        container: {
          maxWidth: '1000px',
          padding: '1.5rem'
        },
        footer: {
          show: true,
          variant: 'minimal'
        }
      }
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/Home.vue')
    // No layout specified - will use default 'simple' layout
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
