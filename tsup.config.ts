import type { Options } from 'tsup'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

const env = process.env.NODE_ENV

const common: Options = {
  splitting: false,
  bundle: true,
  entry: ['src/index.ts', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/mocks/**/*.ts'], //include all files under src
  skipNodeModulesBundle: true,
  target: 'es2020',
  outDir: 'dist',
  shims: true,
  tsconfig: './tsconfig.json'
}

// CJS/ESM configuration
const cjsEsmOptions: Options = {
  dts: true, // generate dts files
  format: ['cjs', 'esm'], // CJS / ESM modules only
  minify: env === 'production',
  sourcemap: true,
  ...common
}

// IIFE (Global) configuration
const iifeOptions: Options = {
  dts: false, // No types for IIFE
  format: ['iife'], // Only IIFE format
  minify: true,
  sourcemap: false,
  globalName: 'ArweaveStorageSDK',
  platform: 'browser',
  banner: {
    js: `if (typeof global === 'undefined') {var global = globalThis;}`
  },
  esbuildPlugins: [
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true
    })
  ],
  esbuildOptions: (options) => {
    options.alias = {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      events: 'events',
      buffer: 'buffer'
    }
  },
  ...common
}

export default [cjsEsmOptions, iifeOptions]
