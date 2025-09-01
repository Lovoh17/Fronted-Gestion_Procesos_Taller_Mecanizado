import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue({
      // Exclude CSS files from Vue processing
      include: [/\.vue$/, /\.vue\?vue/],
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://gestionprocesostallermecanizado-production-d0de.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    allowedHosts: ['fronted-gestionprocesostallermecanizado-production.up.railway.app'],
    fs: {
      strict: false,
      allow: ['.', '..', './node_modules']
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Add CSS configuration
  css: {
    preprocessorOptions: {
      css: {
        // Optional: global CSS imports
        additionalData: `@import "@/assets/EstiloBase.css";`
      }
    }
  }
})