import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginJest from 'eslint-plugin-jest'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { ignores: ['node_modules', 'dist', 'lib', 'coverage'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // update this to match your test files
    files: [
      '**/*.spec.js',
      '**/*.spec.ts',
      'spec/integration/shared-examples.js',
      'spec/browser/middleware/retry/shared-examples.js',
    ],
    ...pluginJest.configs['flat/recommended'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
  },
]
