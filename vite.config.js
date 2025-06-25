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
        target: 'http://localhost:3000',
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
    }
  }
})