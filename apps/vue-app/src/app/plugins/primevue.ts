import type { App } from 'vue'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'

import 'primeicons/primeicons.css'

export function setupPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        // Aura defaults to system dark via prefers-color-scheme; app chrome is mostly light.
        darkModeSelector: '[data-theme="dark"]',
      },
    },
    ripple: true,
  })

  // Register commonly used PrimeVue components globally.
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Column', Column)
  app.component('DataTable', DataTable)
  app.component('Divider', Divider)
  app.component('InputText', InputText)
  app.component('Message', Message)
  app.component('Password', Password)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('Select', Select)
  app.component('Tag', Tag)
  app.component('Textarea', Textarea)
}
