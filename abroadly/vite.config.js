import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load env from parent directory
  const parentEnv = loadEnv(mode, '../', '');

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        // Proxy all backend auth API calls except the frontend /auth page route
        '^/auth/(?!$)': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        // Proxy bookmarks API calls (with subpaths like /bookmarks/programs)
        '^/bookmarks/': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        // Proxy GET /bookmarks (exact match, for getAllBookmarks API)
        '/bookmarks': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          bypass: (req) => {
            // Only proxy if it's an API request (Accept: application/json or XHR)
            const accept = req.headers.accept || '';
            if (accept.includes('application/json') || req.headers['x-requested-with']) {
              return null; // Proxy to backend
            }
            return req.url; // Skip proxy, serve from frontend
          }
        },
        // Proxy messages API calls (with subpaths)
        '^/messages/': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        // AI endpoints
        '/ai': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    },
    // Make parent env vars available (only VITE_ prefixed ones will be exposed to client)
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(parentEnv.VITE_GOOGLE_MAPS_API_KEY || ''),
    }
  };
});