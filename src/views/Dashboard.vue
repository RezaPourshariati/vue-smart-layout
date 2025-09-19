<script setup lang="ts">
// Dashboard logic would go here
</script>

<template>
  <!-- ✅ 90% TailwindCSS + 10% custom animations -->
  <div class="p-0">
    <!-- Dashboard Header -->
    <div class="mb-8">
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
        Dashboard
      </h1>
      <p class="text-base md:text-lg text-gray-600">
        Welcome to your dashboard overview
      </p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-auto-fit gap-6">
      <!-- Analytics Card -->
      <div class="dashboard-card-animated bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2">📊 Analytics</h3>
        <p class="text-gray-600 leading-relaxed mb-4">
          View your site analytics and performance metrics
        </p>
        <div class="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          <span class="text-2xl md:text-3xl font-bold text-emerald-600">1,234</span>
          <span class="text-sm text-gray-500 mt-1">Total Views</span>
        </div>
      </div>

      <!-- Users Card -->
      <div class="dashboard-card-animated bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2">👥 Users</h3>
        <p class="text-gray-600 leading-relaxed mb-4">
          Manage user accounts and permissions
        </p>
        <div class="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          <span class="text-2xl md:text-3xl font-bold text-emerald-600">567</span>
          <span class="text-sm text-gray-500 mt-1">Active Users</span>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="dashboard-card-animated bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
        <p class="text-gray-600 leading-relaxed mb-4">
          Configure your application settings
        </p>
        <button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
          Configure
        </button>
      </div>

      <!-- Recent Activity Card -->
      <div class="dashboard-card-animated bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-4">📝 Recent Activity</h3>
        <ul class="space-y-2">
          <li class="py-2 border-b border-gray-100 last:border-b-0 text-gray-600 text-sm">
            User John logged in
          </li>
          <li class="py-2 border-b border-gray-100 last:border-b-0 text-gray-600 text-sm">
            New order #12345
          </li>
          <li class="py-2 border-b border-gray-100 last:border-b-0 text-gray-600 text-sm">
            System backup completed
          </li>
          <li class="py-2 border-b border-gray-100 last:border-b-0 text-gray-600 text-sm">
            Update deployed
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-animated {
  opacity: 0;
    animation: fadeIn 0.6s ease-in-out 0.1s forwards;

  &:hover {
    transform: translateY(-2px);
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-auto-fit {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
</style>
