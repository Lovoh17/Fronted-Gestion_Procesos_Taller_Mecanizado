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
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


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

// Registra el componente LoadingSpinner globalmente
app.component('LoadingSpinner', LoadingSpinner)

// Monta la aplicación
app.mount('#app')


import '@fortawesome/fontawesome-free/css/all.css'
import './assets/main.css' 

//formulario de login
import { ref } from 'vue';
const email = ref('');
const password = ref('');

const handleLogin = () => {
    console.log('Logging in with:', email.value, password.value);
};

const socialLogin = (provider) => {
    console.log('Logging in with:', provider);
};




