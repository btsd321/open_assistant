module.exports = {
  root: true,
  env: { node: true, browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
}
