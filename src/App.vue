<script setup lang="ts">
import AppLayout from "@/layouts/AppLayout.vue"
import '@/assets/styles/main.scss'
</script>

<template>
  <div class="app">
    <AppLayout>
      <router-view />
    </AppLayout>
  </div>
</template>

<style lang="scss">
.app {
  font-family: $font-family-base;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
}
</style>
