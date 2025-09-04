<template>
  <div class="sidebar-info">
    <h3 class="sidebar-title">Information</h3>
    <div class="info-card">
      <div class="info-item">
        <span class="info-label">Total Items:</span>
        <span class="info-value">1,234</span>
      </div>
      <div class="info-item">
        <span class="info-label">Active:</span>
        <span class="info-value">856</span>
      </div>
      <div class="info-item">
        <span class="info-label">Pending:</span>
        <span class="info-value">234</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: string
}

defineProps<Props>()
</script>

<style scoped>
.sidebar-info {
  padding: 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
}

.info-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  color: #495057;
}
</style>
