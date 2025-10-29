import type { Options } from 'tsup'

const env = process.env.NODE_ENV

const common: Options = {
  splitting: false,
  clean: true, // clean up the dist folder
  bundle: true,
  entry: ['src/index.ts', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/mocks/**/*.ts'], //include all files under src
  skipNodeModulesBundle: true,
  target: 'es2015',
  outDir: 'dist',
  shims: true,
  tsconfig: './tsconfig.json'
}

// Node.js configuration
const node: Options = {
  dts: true, // generate dts files
  format: ['cjs', 'esm'], // Node.js and ES modules only
  minify: env === 'production',
  sourcemap: true,
  ...common
}

// IIFE configuration
const iife: Options = {
  dts: false, // No types for IIFE
  format: ['iife'], // Only IIFE format
  minify: true,
  sourcemap: false,
  ...common
}

export default [node, iife]
