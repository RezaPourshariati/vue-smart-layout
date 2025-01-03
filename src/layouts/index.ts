import { defineAsyncComponent } from 'vue'

const layoutMap = {
  AppLayoutDefault: () => defineAsyncComponent(() => import('@/layouts/AppLayoutDefault.vue')),
  AppLayoutHome: () => defineAsyncComponent(() => import('@/layouts/AppLayoutHome.vue')),
  AppLayoutAbout: () => defineAsyncComponent(() => import('@/layouts/AppLayoutAbout.vue')),
  AppLayoutContacts: () => defineAsyncComponent(() => import('@/layouts/AppLayoutContacts.vue')),
}

export default layoutMap
