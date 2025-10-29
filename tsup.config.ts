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
  target: 'es2015',
  outDir: 'dist',
  entry: ['src/index.ts'], // Only build the main entry point
  shims: true,
  sourcemap: env !== 'production', // Only generate source maps in development
  tsconfig: './tsconfig.json'
}
