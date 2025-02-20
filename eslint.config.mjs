import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginJest from 'eslint-plugin-jest'

const noUnusedVars = {
  'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      args: 'none',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
}

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config([
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { ignores: ['node_modules', 'dist', 'lib', 'coverage'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...noUnusedVars,
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...noUnusedVars,
    },
  },
  {
    // Spec files
    files: [
      '**/*.spec.js',
      '**/*.spec.ts',
      'spec/integration/shared-examples.js',
      'spec/browser/middleware/retry/shared-examples.js',
      'spec/integration/node/support/keep-alive.js',
      'spec/integration/browser/file-upload.js',
      'spec/integration/browser/csrf.js',
      'spec/integration/server.js',
      'spec/helpers/babel.js',
    ],
    ...pluginJest.configs['flat/recommended'],
    rules: {
      ...pluginJest.configs['flat/recommended'].rules,
      'jest/no-conditional-expect': 'off',
      'jest/no-done-callback': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'jest/no-jasmine-globals': 'off',
      'jest/no-export': 'off',
    },
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
  },
  // Two idiot files
  {
    files: ['src/gateway/types.ts', 'src/gateway/xhr.ts'],
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...noUnusedVars,
      'no-undef': 'off',
    },
  },
])
