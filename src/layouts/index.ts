import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

export const layoutMap: Record<string, Component> = {
  AppLayoutDefault: defineAsyncComponent(() => import('./AppLayoutDefault.vue')),
  AppLayoutHome: defineAsyncComponent(() => import('./AppLayoutHome.vue')),
  AppLayoutAbout: defineAsyncComponent(() => import('./AppLayoutAbout.vue')),
  AppLayoutContacts: defineAsyncComponent(() => import('./AppLayoutContacts.vue')),
}

export const defaultLayout: string = 'AppLayoutDefault'

