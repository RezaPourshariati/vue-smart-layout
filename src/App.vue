<script setup lang="ts">
import AppLayout from "@/layouts/AppLayout.vue"
import '@/assets/styles/main.scss'
</script>

<template>
  <!-- ✅ 90% TailwindCSS + 10% global theme variables -->
  <div class="min-h-screen flex flex-col font-sans antialiased text-center theme-app">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>

<style lang="scss">
// ✅ Only theme variables that TailwindCSS can't handle (10% of styling)
@use '@/assets/styles/abstracts' as *;

.theme-app {
  // Use CSS custom properties for theming
  color: var(--theme-text-primary, #{$color-text-primary});
  font-family: var(--font-family-primary, #{$font-family-primary});

  // Complex theming that changes based on user preference
  @media (prefers-color-scheme: dark) {
    color: var(--theme-text-primary, #{$color-gray-100});
  }
}
</style>
