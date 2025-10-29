import type { Options } from 'tsup'

const isDev = process.env.NODE_ENV === 'development'
const isWatch = process.argv.includes('--watch')

export const tsup: Options = {
  splitting: false,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  format: ['cjs', 'esm', 'iife'], // generate cjs, iife and esm files
  minify: !isDev && !isWatch,
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.ts'],
  target: 'es2015',
  outDir: 'dist',
  entry: ['src/index.ts'], // Only build the main entry point
  shims: true,
  sourcemap: isDev || isWatch, // Only generate source maps in development or watch mode
  tsconfig: './tsconfig.json'
}
