module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['standard', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: { 'dot-notation': 'off' },
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
  },
  overrides: [
    {
      files: ['karma.conf.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
