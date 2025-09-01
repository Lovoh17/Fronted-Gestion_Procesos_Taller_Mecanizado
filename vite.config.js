import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue({
      // Remover la configuración include que puede causar conflictos
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
  // Configuración CSS simplificada
  css: {
    // Remover preprocessorOptions para CSS plano
  }
})