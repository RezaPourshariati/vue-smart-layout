<script setup lang="ts">
import AppLayoutLinks from "./AppLayoutLinks.vue"
</script>

<template>
  <div class="container">
    <header class="header" />
    <AppLayoutLinks />
    <div class="home-page-layout">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}

.home-page-layout {
  width: 100%;
  max-width: 1100px;
  border: 2px solid red;
  margin: 0 2rem;
  height: 100vh;
}

.header {
  height: 5rem;
  background-color: green;
}
</style>
