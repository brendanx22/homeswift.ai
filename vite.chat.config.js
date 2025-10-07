import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Ensure environment variables are loaded in Vite
const env = {};
Object.keys(process.env).forEach((key) => {
  if (key.startsWith('VITE_')) {
    env[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
  }
});

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
    ...env,
    // Ensure Vite can access environment variables
    'import.meta.env.VITE_APP_MODE': JSON.stringify('chat'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || '')
  },
  build: {
    outDir: 'dist/chat',
    emptyOutDir: true,
    sourcemap: !isProduction,
    minify: isProduction ? 'terser' : false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
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
      port: 3001, // Different port for chat
      strictPort: true,
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
      outDir: 'dist/chat',
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
