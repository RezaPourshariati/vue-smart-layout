<script setup lang="ts">
import AppLayoutLinks from "./AppLayoutLinks.vue"
</script>

<template>
  <div class="">
    <header class="header" />
    <AppLayoutLinks />
    <div class="home-page-layout">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: $spacing-sm;
}

.home-page-layout {
  width: 100%;
  max-width: 1100px;
  margin: $spacing-md auto;
  // height: calc(100vh - 5rem);
  padding: $spacing-sm;
  border: 2px solid $primary-color;
  border-radius: 8px;

  @include responsive(sm) {
    padding: $spacing-md;
    margin: $spacing-lg auto;
  }

  @include responsive(md) {
    padding: $spacing-lg;
    margin: $spacing-xl auto;
  }
}

.header {
  width: 100%;
  // height: 5rem;
  background-color: $secondary-color;

  @include responsive(md) {
    height: 5rem;
  }
}

// Responsive container adjustments
.container {
  @include responsive(sm) {
    padding: $spacing-md;
  }

  @include responsive(md) {
    padding: $spacing-lg;
  }

  @include responsive(lg) {
    padding: $spacing-xl;
  }
}
</style>
