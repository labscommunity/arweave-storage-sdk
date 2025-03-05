import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const nodePolyfillsFix = (options) => {
  return {
    ...nodePolyfills(options),
    resolveId(source) {
      const m = /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(source)
      if (m) {
        return `node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`
      }
    }
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfillsFix({
      globals: {
        global: true,
        Buffer: true,
        process: true
      },
      include: ['buffer', 'process', 'url', "path", "crypto", "stream", "vm"],
      protocolImports: true
    })
  ]
})
