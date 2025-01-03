<script setup lang="ts">
import AppLayoutLinks from "./AppLayoutLinks.vue"
</script>

<template>
  <div>
    <header class="header" />
    <AppLayoutLinks />
    <slot />
  </div>
</template>

<style scoped>
.header {
  height: 5rem;
  background-color: green;
}
</style>
