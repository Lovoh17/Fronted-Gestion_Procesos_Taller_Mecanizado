import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Chart, registerables } from 'chart.js'

//createApp(App).mount('#app')
const app = createApp(App)
app.use(router)
app.mount('#app')
Chart.register(...registerables)


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




