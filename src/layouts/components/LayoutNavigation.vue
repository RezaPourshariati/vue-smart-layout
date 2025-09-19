<script setup lang="ts">

interface Props {
  variant?: 'minimal' | 'standard' | 'hero'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'standard'
})

// In a real app, this would come from a store or API
const navigationLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contacts', path: '/contacts' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile', path: '/profile' },
  { name: 'Landing', path: '/landing' },
  // { name: 'Wow', path: '/wow' }
]

const getLinkClasses = (variant: string) => {
  const baseClasses = 'hover:bg-gray-100 active:bg-gray-200'

  switch (variant) {
    case 'minimal':
      return `${baseClasses} text-gray-600 hover:text-gray-900`
    case 'hero':
      return 'text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20'
    case 'standard':
    default:
      return `${baseClasses} text-gray-700 hover:text-gray-900`
  }
}
</script>

<template>
  <!-- ✅ 95% TailwindCSS + 5% custom active states -->
  <nav class="flex items-center space-x-1 md:space-x-2">
    <router-link
      v-for="link in navigationLinks"
      :key="link.path"
      :to="link.path"
      :class="[
        'nav-link-animated px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
        getLinkClasses(props.variant)
      ]"
    >
      {{ link.name }}
    </router-link>
  </nav>
</template>

<style scoped>
/* ✅ Only complex router-link active states (5% of styling) */

.nav-link-animated { position: relative }

.nav-link-animated.router-link-active {
  color: var(--color-emerald-600);
  background-color: var(--color-emerald-50);
}

.nav-link-animated.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--color-emerald-600);
  animation: expandUnderline 0.3s ease-out forwards;
}

/* Hero variant active state */
.nav-link-animated.router-link-active:where(.text-white\/90) {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link-animated.router-link-active:where(.text-white\/90)::after {
  background-color: white;
}

@keyframes expandUnderline {
  from { width: 0 }
  to { width: 80% }
}
</style>
