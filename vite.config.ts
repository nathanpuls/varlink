import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom plugin to remove the importmap from index.html during the production build.
 * This prevents conflicts between CDN-loaded modules and Vite's bundled assets.
 */
const removeImportMap = () => {
  return {
    name: 'remove-importmap',
    transformIndexHtml(html: string) {
      return html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
    },
  };
};

export default defineConfig({
  plugins: [react(), removeImportMap()],
  define: {
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Addressing the build warning by increasing the limit for large library bundles
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/database']
        }
      }
    }
  }
});