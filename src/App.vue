<script setup lang="ts">
import AppLayout from "@/layouts/AppLayout.vue"
// import '@/assets/styles/main.scss'
</script>

<template>
  <!-- ✅ 90% TailwindCSS + 10% global theme variables -->
  <div class="min-h-screen flex flex-col font-sans antialiased text-center theme-app">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>
