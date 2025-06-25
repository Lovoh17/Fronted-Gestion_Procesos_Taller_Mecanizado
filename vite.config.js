import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://gestionprocesostallermecanizado-production.up.railway.app.app', // URL de tu backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    fs: {
      allow: [
        // Directorio del proyecto actual (usa process.cwd() para obtener la ruta dinámicamente)
        process.cwd(),
        // Directorio de node_modules
        '/home/kev/Documents/GIT_HUB/Fronted-Gestion_Procesos_Taller_Mecanizado/node_modules'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
