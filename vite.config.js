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
        target: 'http://localhost:3000', // URL de tu backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    fs: {
      allow: [
        // Your project root
        'C:/Users/linol/OneDrive/Documentos/GitHub/Fronted-Gestion_Procesos_Taller_Mecanizado/Fronted-Gestion_Procesos_Taller_Mecanizado',
        // Add node_modules if needed
        'C:/Users/linol/node_modules'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
