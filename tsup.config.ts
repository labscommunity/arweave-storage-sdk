import type { Options } from 'tsup'

const env = process.env.NODE_ENV

export const tsup: Options = {
  splitting: false,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  format: ['cjs', 'esm', 'iife'], // generate cjs, iife and esm files
  minify: env === 'production',
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.ts'],
  watch: env === 'development',
  target: 'es2015',
  outDir: 'dist',
  entry: ['src/**/*.ts', '!src/**/__tests__/**', '!src/**/*.test.*'], //include all files under src
  shims: true,
  sourcemap: true,
  tsconfig: './tsconfig.json'
}
