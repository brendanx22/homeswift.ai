import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node's process.env
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  const isProduction = mode === 'production';
  
  return defineConfig({
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      })
    ],
    base: isProduction ? './' : '/',
    define: {
      'process.env': process.env,
      global: 'globalThis',
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      modulePreload: {
        polyfill: false,
      },
      commonjsOptions: {
        include: [],
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    define: {
      'process.env': {},
    },
  });
};
