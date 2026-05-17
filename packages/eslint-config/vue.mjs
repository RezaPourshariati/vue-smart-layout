import antfu from '@antfu/eslint-config'
import { sharedRules } from './shared-rules.mjs'
import { vueRules } from './vue-rules.mjs'

export default antfu({
  unocss: true,
  formatters: true,
  pnpm: true,
  vue: true,
  typescript: true,
}).append(sharedRules, vueRules)
