// vite.main.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'landing',
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: '../dist',   // ⬅️ change from ../main to ../dist
  },
})
