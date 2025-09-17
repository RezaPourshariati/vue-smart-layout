import { createApp } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.component('AppLayout', AppLayout)
app.mount('#app')
