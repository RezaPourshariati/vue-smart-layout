<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav id="nav">
    <RouterLink to="/">Home</RouterLink>|
    <RouterLink to="/about">About</RouterLink>|
    <RouterLink to="/contacts">Contacts</RouterLink>|
    <RouterLink to="/test">Test</RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
#nav {
  padding: $spacing-sm;
  background-color: lighten($primary-color, 10%);

  a {
    color: white;
    text-decoration: none;
    padding: $spacing-xs $spacing-sm;
    margin: 0 $spacing-xs;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(white, 0.1);
    }

    &.router-link-active {
      background-color: $secondary-color;
    }
  }

  @include responsive(sm) {
    padding: $spacing-md;

    a {
      padding: $spacing-sm $spacing-md;
      margin: 0 $spacing-sm;
      font-size: 1.1em;
    }
  }

  @include responsive(md) {
    padding: $spacing-lg;

    a {
      padding: $spacing-md $spacing-lg;
      margin: 0 $spacing-md;
      font-size: 1.2em;
    }
  }
}
</style>
