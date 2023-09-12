import { defineConfig, Options } from 'tsup'
// import fs from 'fs'

// Inspired by https://github.com/immerjs/immer/pull/1032/files
export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: [
      'src/**/*.[jt]s',
      '!./src/**/*.d.ts',
      '!./src/**/*.spec.[jt]s',
      '!src/index.js', // <-- NOPE! USE THE BELOW OVERRIDE INSTEAD:
      'src/index.d.ts',
    ],
    platform: 'node',
    target: 'node16',
    splitting: false,
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
    // ESM, standard bundler dev, embedded `process` references.
    // (this is consumed by ["exports" > "." > "import"] and ["exports > "." > "types"] in package.json)
    {
      ...commonOptions,
      ...dtsOptions,
      format: ['esm'],
      // dts: true,
      clean: true,
      // sourcemap: true,
    },
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
  ]
})
