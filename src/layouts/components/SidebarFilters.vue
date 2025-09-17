<script setup lang="ts">
interface Props {
  variant?: string
}

defineProps<Props>()
</script>

<template>
  <div class="sidebar-filters">
    <h3 class="sidebar-title">Filters</h3>
    <div class="filter-group">
      <label class="filter-label">Category</label>
      <select class="filter-select">
        <option>All Categories</option>
        <option>Technology</option>
        <option>Design</option>
        <option>Business</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Status</label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" /> Active
        </label>
        <label class="checkbox-label">
          <input type="checkbox" /> Pending
        </label>
        <label class="checkbox-label">
          <input type="checkbox" /> Completed
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-filters {
  padding: 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}
</style>
