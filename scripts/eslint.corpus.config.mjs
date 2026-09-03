import security from 'eslint-plugin-security'

const scanRoot = process.env.SCAN_ROOT ?? 'corpus'

/** Dedicated ESLint config for corpus only — no project style rules. */
export default [
  {
    files: [`${scanRoot}/**/*.{ts,tsx,js,jsx,mjs,cjs}`],
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
