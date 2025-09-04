<template>
  <div class="profile">
    <div class="profile-header">
      <div class="profile-avatar">
        <img src="/favicon.ico" alt="Profile Avatar" />
      </div>
      <div class="profile-info">
        <h1>John Doe</h1>
        <p class="profile-title">Frontend Developer</p>
        <p class="profile-location">📍 San Francisco, CA</p>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="profile-section">
        <h2>About</h2>
        <p>
          Passionate frontend developer with 5+ years of experience building modern web applications. 
          Specialized in Vue.js, TypeScript, and creating exceptional user experiences.
        </p>
      </div>
      
      <div class="profile-section">
        <h2>Skills</h2>
        <div class="skills-grid">
          <span class="skill-tag">Vue.js</span>
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">JavaScript</span>
          <span class="skill-tag">CSS/SCSS</span>
          <span class="skill-tag">Node.js</span>
          <span class="skill-tag">Git</span>
        </div>
      </div>
      
      <div class="profile-section">
        <h2>Recent Projects</h2>
        <div class="projects-list">
          <div class="project-card">
            <h3>Vue Smart Layout</h3>
            <p>A flexible, composable layout system for Vue.js applications</p>
            <div class="project-tech">
              <span>Vue.js</span>
              <span>TypeScript</span>
              <span>Vite</span>
            </div>
          </div>
          
          <div class="project-card">
            <h3>E-commerce Dashboard</h3>
            <p>Modern admin dashboard for managing online store operations</p>
            <div class="project-tech">
              <span>React</span>
              <span>Node.js</span>
              <span>MongoDB</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h2>Contact Information</h2>
        <div class="contact-info">
          <div class="contact-item">
            <strong>Email:</strong> john.doe@example.com
          </div>
          <div class="contact-item">
            <strong>Phone:</strong> +1 (555) 123-4567
          </div>
          <div class="contact-item">
            <strong>LinkedIn:</strong> /in/johndoe
          </div>
          <div class="contact-item">
            <strong>GitHub:</strong> @johndoe
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Profile logic would go here
</script>

<style scoped>
/* Profile styles are now handled by the global Sass architecture */
/* See src/assets/styles/pages/_profile.scss for all profile styling */
</style>
