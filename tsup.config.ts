import { defineConfig, Options } from 'tsup'
import fs from 'fs'

// Inspired by https://github.com/immerjs/immer/pull/1032/files
export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      mappersmith: 'src/index.js',
    },
    platform: 'node',
    target: 'node16',
    sourcemap: true,
    clean: true,
    ...options,
  }
  const productionOptions = {
    minify: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  }
  const dtsOptions = {
    dts: {
      only: true,
      compilerOptions: {
        resolveJsonModule: false,
        outDir: './dist/',
      },
    },
  }

  return [
    // ESM, standard bundler dev, embedded `process` references.
    // (this is consumed by ["exports" > "." > "import"] and ["exports > "." > "types"] in package.json)
    {
      ...commonOptions,
      ...dtsOptions,
      format: ['esm'],
    },
    // ESM, Webpack 4 support. Target ES2018 syntax to compile away optional chaining and spreads
    // (this is consumed by "module" in package.json)
    {
      ...commonOptions,
      entry: {
        'mappersmith.legacy-esm': 'src/index.js',
      },
      // ESBuild outputs `'.mjs'` by default for the 'esm' format. Force '.js'
      outExtension: () => ({ js: '.js' }),
      platform: 'browser',
      target: 'es2015',
      format: ['esm'],
    },
    // ESM for use in browsers. Minified, with `process` compiled away
    {
      ...commonOptions,
      ...productionOptions,
      entry: {
        'mappersmith.production': 'src/index.js',
      },
      platform: 'browser',
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
    },
    // CJS development
    {
      ...commonOptions,
      entry: {
        'mappersmith.cjs.development': 'src/index.js',
      },
      format: ['cjs'],
      outDir: './dist/cjs/',
    },
    // CJS production
    // (this is consumed by "main" and ["exports" > "." > "require"] in package.json)
    {
      ...commonOptions,
      ...productionOptions,
      entry: {
        'mappersmith.cjs.production': 'src/index.js',
      },
      format: ['cjs'],
      outDir: './dist/cjs/',
      onSuccess: async () => {
        // Write the CJS index file
        fs.writeFileSync(
          'dist/cjs/index.js',
          `
'use strict'
if (process.env.NODE_ENV === 'production') {
	module.exports = require('./mappersmith.cjs.production.min.js')
} else {
	module.exports = require('./mappersmith.cjs.development.js')
}`
        )
      },
    },
  ]
})
