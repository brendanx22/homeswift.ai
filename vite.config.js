import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node's process.env
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  const isProduction = mode === 'production';
  const isChat = mode === 'chat';

  // Log environment variables for debugging
  console.log('Vite Config - Mode:', mode);
  console.log('API Base URL:', env.VITE_API_BASE_URL);
  console.log('Supabase URL:', env.VITE_SUPABASE_URL);

  return defineConfig({
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            [
              '@emotion/babel-plugin',
              {
                autoLabel: 'dev-only',
                labelFormat: '[local]',
                cssPropOptimization: true,
              },
            ],
          ],
        },
      }),
    ],
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    base: isProduction ? '/' : '/',
    define: {
      'process.env': {},
    },
    // Ensure Vite handles environment variables correctly
    envPrefix: 'VITE_',
    server: {
      port: 3000,
      open: true,
      cors: true,
      headers: {
        'Content-Security-Policy': isProduction 
          ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.homeswift.co https://*.vercel.app https://tproaiqvkohrlxjmkgxt.supabase.co https://*.supabase.co wss://*.supabase.co https://vercel.live; frame-src 'self' https://*.supabase.co https://vercel.live; worker-src 'self' blob:;"
          : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;"
      }
    },
    resolve: {
      alias: [
        {
          find: /^hoist-non-react-statics(\/.*)?$/,
          replacement: 'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js',
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
        {
          find: "@/",
          replacement: path.resolve(__dirname, "./src/"), // Add this for @/ imports
        },
      ],
    },
    
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      proxy: {
        "/api": {
          target: process.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5002",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
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
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  });
};
