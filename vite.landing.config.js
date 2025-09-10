import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic',
            importSource: '@emotion/react'
          }],
          ['@emotion/babel-plugin', {
            autoLabel: 'dev-only',
            labelFormat: '[local]',
            cssPropOptimization: true
          }]
        ]
      },
    })
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  base: '/',
  build: {
    outDir: 'dist/landing',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env': {
      VITE_APP_ENV: 'landing',
      VITE_API_URL: 'https://homeswift-ai-backend.vercel.app',
    },
  },
});
