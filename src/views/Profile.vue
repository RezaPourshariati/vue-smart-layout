<script setup lang="ts">
// Profile logic would go here
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div
      class="profile-header flex items-center gap-8 mb-12 p-8 rounded-xl text-white md:flex-col md:text-center md:gap-6 md:p-6">
      <div class="flex-shrink-0">
        <img src="/favicon.ico" alt="Profile Avatar"
          class="w-30 h-30 rounded-full border-4 border-white/30 object-cover md:w-25 md:h-25" />
      </div>
      <div>
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2">John Doe</h1>
        <p class="text-base md:text-lg lg:text-xl opacity-90 mb-2">Frontend Developer</p>
        <p class="opacity-80">📍 San Francisco, CA</p>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <div class="bg-white border border-gray-200 rounded-md p-8 shadow-sm md:p-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b-2 border-emerald-600 pb-2">About</h2>
        <p class="text-gray-600 leading-relaxed">
          Passionate frontend developer with 5+ years of experience building modern web applications.
          Specialized in Vue.js, TypeScript, and creating exceptional user experiences.
        </p>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-8 shadow-sm md:p-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b-2 border-emerald-600 pb-2">Skills</h2>
        <div class="flex flex-wrap gap-3">
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Vue.js</span>
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">TypeScript</span>
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">JavaScript</span>
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">CSS/SCSS</span>
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Node.js</span>
          <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Git</span>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-8 shadow-sm md:p-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b-2 border-emerald-600 pb-2">Recent Projects
        </h2>
        <div class="flex flex-col gap-6">
          <div
            class="border border-gray-200 rounded-md p-6 transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Vue Smart Layout</h3>
            <p class="text-gray-600 leading-relaxed mb-4">A flexible, composable layout system for Vue.js applications
            </p>
            <div class="flex gap-2 flex-wrap">
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Vue.js</span>
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">TypeScript</span>
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Vite</span>
            </div>
          </div>

          <div
            class="border border-gray-200 rounded-md p-6 transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">E-commerce Dashboard</h3>
            <p class="text-gray-600 leading-relaxed mb-4">Modern admin dashboard for managing online store operations
            </p>
            <div class="flex gap-2 flex-wrap">
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">React</span>
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">Node.js</span>
              <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">MongoDB</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-8 shadow-sm md:p-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b-2 border-emerald-600 pb-2">Contact
          Information</h2>
        <div class="grid gap-4">
          <div class="p-3 bg-gray-50 rounded-md border-l-4 border-emerald-600">
            <strong class="text-gray-900 mr-2">Email:</strong>
            <span class="text-gray-700">john.doe@example.com</span>
          </div>
          <div class="p-3 bg-gray-50 rounded-md border-l-4 border-emerald-600">
            <strong class="text-gray-900 mr-2">Phone:</strong>
            <span class="text-gray-700">+1 (555) 123-4567</span>
          </div>
          <div class="p-3 bg-gray-50 rounded-md border-l-4 border-emerald-600">
            <strong class="text-gray-900 mr-2">LinkedIn:</strong>
            <span class="text-gray-700">/in/johndoe</span>
          </div>
          <div class="p-3 bg-gray-50 rounded-md border-l-4 border-emerald-600">
            <strong class="text-gray-900 mr-2">GitHub:</strong>
            <span class="text-gray-700">@johndoe</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind utility classes */
</style>
