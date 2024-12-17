module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    'warp-contracts-plugin-signature': '<rootDir>/node_modules/warp-contracts-plugin-signature/lib/cjs/web/index.js'
  },
  setupFiles: ['./setupJestMock.ts']
}
