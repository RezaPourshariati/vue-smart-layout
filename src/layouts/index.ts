import { defineAsyncComponent } from 'vue'

export const layoutMap: any = {
  AppLayoutDefault: defineAsyncComponent(() => import('./AppLayoutDefault.vue')),
  AppLayoutHome: defineAsyncComponent(() => import('./AppLayoutHome.vue')),
  AppLayoutAbout: defineAsyncComponent(() => import('./AppLayoutAbout.vue')),
  AppLayoutContacts: defineAsyncComponent(() => import('./AppLayoutContacts.vue')),
}

export const defaultLayout: string = 'AppLayoutDefault'

