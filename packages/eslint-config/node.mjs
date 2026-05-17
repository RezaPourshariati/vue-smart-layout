import antfu from '@antfu/eslint-config'
import { sharedRules } from './shared-rules.mjs'

export default antfu({
  typescript: true,
  formatters: true,
  pnpm: true,
}).append(sharedRules)
