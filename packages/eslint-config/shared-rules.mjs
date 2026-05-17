/** @type {import('eslint').Linter.Config[]} */
export const sharedRules = {
  rules: {
    'node/prefer-global/process': 'off',
    'pnpm/json-enforce-catalog': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'warn',
  },
}
