import { createPinia } from 'pinia'
import { createApp } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { setupPrimeVue } from '@/plugins/primevue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setupPrimeVue(app)
app.use(router)
app.component('AppLayout', AppLayout)
app.mount('#app')
