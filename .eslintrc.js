module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'standard'
    // 'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true
  }
}
