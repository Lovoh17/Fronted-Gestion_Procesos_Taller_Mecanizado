import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/variables.css'
import LoadingSpinner from './components/GlobalComponents/LoadingSpinner.vue'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { Chart, registerables } from 'chart.js'

// Vuestic UI
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vue Good Table Next
import VueGoodTablePlugin from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

// Iconos
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

// Configura Chart.js
Chart.register(...registerables)

// Crea y configura la aplicación
const app = createApp(App)
const pinia = createPinia()

// Instala los plugins en el orden correcto
app.use(pinia) // Pinia debe instalarse primero
app.use(router)
app.use(vuetify)
app.use(createVuestic()) // Agrega Vuestic UI
app.use(VueGoodTablePlugin) // Agrega vue-good-table-next

// Registra el componente LoadingSpinner globalmente
app.component('LoadingSpinner', LoadingSpinner)

// Monta la aplicación
app.mount('#app')

// DESPUÉS de montar la app, inicializar el store de autenticación
// Esto debe hacerse después del mount para asegurar que Pinia esté completamente configurado
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initializeAuth()