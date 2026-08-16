import security from 'eslint-plugin-security'

/** Dedicated ESLint config for corpus only — no project style rules. */
export default [
  {
    files: ['corpus/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
    },
  },
]
