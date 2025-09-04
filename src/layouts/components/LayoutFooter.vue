<template>
  <footer 
    :class="footerClasses"
    :style="footerStyles"
  >
    <div class="footer-content">
      <div v-if="config.variant === 'minimal'" class="footer-minimal">
        <p>&copy; 2024 Vue Smart Layout. All rights reserved.</p>
      </div>
      
      <div v-else-if="config.variant === 'extended'" class="footer-extended">
        <div class="footer-section">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/api">API</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div v-else class="footer-standard">
        <div class="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
        <p>&copy; 2024 Vue Smart Layout</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FooterConfig } from '../types'

interface Props {
  config: FooterConfig
}

const props = defineProps<Props>()

const footerClasses = computed(() => [
  'layout-footer',
  `footer-${props.config.variant || 'standard'}`
])

const footerStyles = computed(() => ({
  backgroundColor: props.config.color || undefined
}))
</script>

<style scoped>
.layout-footer {
  width: 100%;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.footer-minimal {
  text-align: center;
}

.footer-minimal p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.footer-standard {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: #42b983;
}

.footer-standard p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.footer-extended {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  margin-bottom: 1rem;
  color: #495057;
  font-size: 1rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-section a:hover {
  color: #42b983;
}
</style>
