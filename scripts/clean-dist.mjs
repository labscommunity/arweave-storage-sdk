import fs from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'dist')

async function clean() {
  try {
    await fs.rm(distDir, { recursive: true, force: true })
    console.log('✓ Cleaned dist directory')
  } catch (error) {
    console.error('Error cleaning dist directory:', error)
    process.exit(1)
  }
}

clean()
