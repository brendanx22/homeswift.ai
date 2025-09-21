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
          plugins: [
            ['@emotion/babel-plugin', {
              autoLabel: 'dev-only',
              labelFormat: '[local]',
              cssPropOptimization: true,
            }],
          ],
        },
      })
    ],
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    base: '/',
    define: {
      'process.env': {}
    },
    // Ensure Vite handles environment variables correctly
    envPrefix: 'VITE_',
    resolve: {
      alias: [
        {
          find: /^hoist-non-react-statics(\/.*)?$/,
          replacement: 'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js'
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, './src')
        },
        {
          find: '@/',
          replacement: path.resolve(__dirname, './src/') // Add this for @/ imports
        }
      ]
    },
    server: {
      host: true,  // Listen on all network interfaces
      port: 5173,
      strictPort: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5002',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true, // Enable sourcemaps for debugging
      emptyOutDir: true,
      assetsInlineLimit: 0, // Ensure all assets are emitted as files
      modulePreload: {
        polyfill: false,
      },
      commonjsOptions: {
        include: [/node_modules/],
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
  });
};

