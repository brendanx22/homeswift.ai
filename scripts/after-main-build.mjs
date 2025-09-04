import { existsSync, renameSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const from = join(distDir, 'landing.html')
const to = join(distDir, 'index.html')

if (existsSync(from)) {
  try {
    renameSync(from, to)
    console.log('Renamed dist/landing.html -> dist/index.html')
  } catch (err) {
    console.error('Rename failed:', err)
    process.exit(1)
  }
} else if (!existsSync(to)) {
  console.error('Expected dist/landing.html or dist/index.html not found')
  process.exit(1)
}


