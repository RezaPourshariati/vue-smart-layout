<template>
  <div class="sidebar-navigation">
    <h3 class="sidebar-title">Navigation</h3>
    <ul class="nav-list">
      <li v-for="link in navigationLinks" :key="link.path">
        <router-link :to="link.path" class="nav-item">
          <span class="nav-icon">{{ link.icon }}</span>
          <span class="nav-text">{{ link.name }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: string
}

defineProps<Props>()

const navigationLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Profile', path: '/profile', icon: '👤' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
  { name: 'Help', path: '/help', icon: '❓' }
]
</script>

<style scoped>
.sidebar-navigation {
  padding: 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: #6c757d;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
}

.nav-item.router-link-active {
  background: #42b983;
  color: white;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.nav-text {
  font-weight: 500;
}
</style>
