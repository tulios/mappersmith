import { defineConfig, Options } from 'tsup'

// Inspired by https://github.com/immerjs/immer/pull/1032/files
export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: ['src/**/*.[jt]s', '!./src/**/*.d.ts', '!./src/**/*.spec.[jt]s'],
    platform: 'node',
    target: 'node16',
    // `splitting` should be false, it ensures we are not getting any `chunk-*` files in the output.
    splitting: false,
    // `bundle` should be false, it ensures we are not getting the entire bundle in EVERY file of the output.
    bundle: false,
    // `sourcemap` should be true, we want to be able to point users back to the original source.
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

  return [
    // ESM, standard bundler dev, embedded `process` references.
    // (this is consumed by ["exports" > "." > "import"] and ["exports > "." > "types"] in package.json)
    {
      ...commonOptions,
      format: ['esm'],
      clean: true,
      outDir: './dist/esm/',
      dts: {
        compilerOptions: {
          resolveJsonModule: false,
          outDir: './dist',
        },
      },
    },
    // ESM for use in browsers. Minified, with `process` compiled away
    {
      ...commonOptions,
      ...productionOptions,
      // `splitting` should be true (revert to the default)
      splitting: true,
      // `bundle` should be true, so we get everything in one file.
      bundle: true,
      entry: {
        'mappersmith.production.min': 'src/index.ts',
      },
      platform: 'browser',
      format: ['esm'],
      outDir: './dist/browser/',
    },
    // CJS
    {
      ...commonOptions,
      clean: true,
      format: ['cjs'],
      outDir: './dist/',
    },
  ]
})
