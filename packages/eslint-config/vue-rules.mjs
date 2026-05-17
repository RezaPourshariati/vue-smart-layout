/** @type {import('eslint').Linter.Config[]} */
export const vueRules = {
  rules: {
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 1 },
      multiline: { max: 1 },
    }],
  },
}
