<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Vue Smart Layout</h1>
        <p class="hero-subtitle">
          Build scalable, flexible layouts with our composable layout system
        </p>
        <div class="hero-actions">
          <button class="btn-primary">Get Started</button>
          <button class="btn-secondary">Learn More</button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="layout-preview">
          <div class="preview-header"></div>
          <div class="preview-body">
            <div class="preview-sidebar"></div>
            <div class="preview-content"></div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose Vue Smart Layout?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Flexible Design</h3>
            <p>Create any layout combination with our composable system</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>High Performance</h3>
            <p>Optimized for speed with lazy loading and code splitting</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h3>Easy Configuration</h3>
            <p>Simple preset system with full customization options</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Mobile-first design that works on all screen sizes</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3>Type Safe</h3>
            <p>Full TypeScript support for better developer experience</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Production Ready</h3>
            <p>Battle-tested components ready for enterprise use</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Code Example Section -->
    <section class="code-example">
      <div class="container">
        <h2 class="section-title">Simple to Use</h2>
        <div class="code-showcase">
          <div class="code-block">
            <pre><code>// Router configuration
{
  path: '/dashboard',
  component: Dashboard,
  meta: { 
    layout: 'dashboard' 
  }
}

// Custom layout
{
  path: '/profile',
  meta: {
    layout: {
      header: { type: 'hero' },
      sidebar: { position: 'right' },
      container: { maxWidth: '1000px' }
    }
  }
}</code></pre>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of developers building amazing applications</p>
        <button class="btn-primary large">Start Building Today</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Landing page logic would go here
</script>

<style lang="scss" scoped>
/* Landing styles are now handled by the global Sass architecture */
/* See src/assets/styles/pages/_landing.scss for all landing styling */
</style>
