module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['standard', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'comma-dangle': ['error', 'only-multiline'],
  },
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
  },
}
