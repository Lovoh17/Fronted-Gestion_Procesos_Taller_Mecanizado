import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { Chart, registerables } from 'chart.js'

// Configura Chart.js
Chart.register(...registerables)

// Crea y configura la aplicación
const app = createApp(App)
const pinia = createPinia()

// Instala los plugins en el orden correcto
app.use(pinia) // Pinia debe instalarse primero
app.use(router)

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




