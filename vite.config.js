import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vite.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node's process.env
  const env = loadEnv(mode, process.cwd(), '');
  
  // Set NODE_ENV based on Vite's mode
  process.env.NODE_ENV = mode;
  
  // Merge other environment variables
  process.env = { ...process.env, ...env };

  const isProduction = mode === 'production';
  
  return defineConfig({
    plugins: [
      react({
        jsxRuntime: 'automatic',
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
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    base: isProduction ? './' : '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    resolve: {
      alias: [
        {
          find: /^hoist-non-react-statics(\/.*)?$/,
          replacement: 'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js'
        }
      ]
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true, // Listen on all network interfaces
      proxy: {
        // API routes
        '/api': {
          target: process.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
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

