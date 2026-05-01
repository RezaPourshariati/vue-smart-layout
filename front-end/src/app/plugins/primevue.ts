import type { App } from 'vue'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import PrimeVue from 'primevue/config'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'

import 'primeicons/primeicons.css'

export function setupPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
    },
    ripple: true,
  })

  // Register commonly used PrimeVue components globally.
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Divider', Divider)
  app.component('InputText', InputText)
  app.component('Message', Message)
  app.component('Password', Password)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('Tag', Tag)
  app.component('Textarea', Textarea)
}
