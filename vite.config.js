import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        //https://gestionprocesostallermecanizado-production.up.railway.app
        target: 'https://gestionprocesostallermecanizado-production-d0de.up.railway.app', // URL de tu backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    allowedHosts: ['fronted-gestionprocesostallermecanizado-production.up.railway.app'],
    fs: {
      // Permitir acceso a archivos del proyecto
      strict: false,
      allow: [
        // Directorio del proyecto actual
        '.',
        // Directorio padre (por si acaso)
        '..',
        // node_modules local
        './node_modules'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})