import { defineConfig, Options } from 'tsup'
// import fs from 'fs'

// Inspired by https://github.com/immerjs/immer/pull/1032/files
export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    // entry: ['src/index.js', './src/**/*.[jt]s', '!./src/**/*.d.ts', '!./src/**/*.spec.[jt]s'],
    entry: [
      'src/mappersmith.ts',
      'src/test/**/*.[jt]s',
      'src/middleware/**/*.[jt]s',
      'src/middlewares/**/*.[jt]s',
      'src/middlewares/**/*.[jt]s',
      'src/gateway/**/*.ts',
      '!./src/**/*.d.ts',
      '!./src/**/*.spec.[jt]s',
      // 'src/index.js', <-- NOPE! USE THE BELOW OVERRIDE INSTEAD:
      'src/index.d.ts',
    ],
    platform: 'node',
    target: 'node16',
    clean: true,
    ...options,
  }
  const productionOptions = {
    minify: true,
    esbuildOptions(options) {
      options.mangleProps = /_$/
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  }
  const dtsOptions = {
    dts: {
      // only: true,
      compilerOptions: {
        resolveJsonModule: false,
        outDir: './dist',
      },
    },
  }

  return [
    // // ESM, standard bundler dev, embedded `process` references.
    // // (this is consumed by ["exports" > "." > "import"] and ["exports > "." > "types"] in package.json)
    {
      ...commonOptions,
      ...dtsOptions,
      format: ['esm'],
      // dts: true,
      clean: true,
      // sourcemap: true,
    },
    // ESM, Webpack 4 support. Target ES2018 syntax to compile away optional chaining and spreads
    // (this is consumed by "module" in package.json)
    // {
    //   ...commonOptions,
    //   entry: {
    //     'mappersmith.legacy-esm': 'src/index.js',
    //   },
    //   // ESBuild outputs `'.mjs'` by default for the 'esm' format. Force '.js'
    //   outExtension: () => ({ js: '.js' }),
    //   platform: 'browser',
    //   target: 'es2015',
    //   outDir: './dist/legacy-esm/',
    //   format: ['esm'],
    //   sourcemap: true,
    // },
    // ESM for use in browsers. Minified, with `process` compiled away
    {
      ...commonOptions,
      ...productionOptions,
      entry: {
        'mappersmith.production.min': 'src/index.js',
      },
      platform: 'browser',
      format: ['esm'],
      outDir: './dist/browser/',
      outExtension: () => ({ js: '.mjs' }),
    },
    // CJS development
    {
      ...commonOptions,
      clean: true,
      format: ['cjs'],
      outDir: './dist/cjs/',
    },
    // CJS production
    // (this is consumed by "main" and ["exports" > "." > "require"] in package.json)
    //     {
    //       ...commonOptions,
    //       ...productionOptions,
    //       entry: {
    //         'mappersmith.cjs.production.min': 'src/index.js',
    //       },
    //       format: ['cjs'],
    //       outDir: './dist/cjs/',
    //       onSuccess: async () => {
    //         // Write the CJS index file
    //         fs.writeFileSync(
    //           'dist/cjs/index.js',
    //           `'use strict'
    // if (process.env.NODE_ENV === 'production') {
    // 	module.exports = require('./mappersmith.cjs.production.min.js')
    // } else {
    // 	module.exports = require('./mappersmith.cjs.development.js')
    // }`
    //         )
    //       },
    //     },
  ]
})
