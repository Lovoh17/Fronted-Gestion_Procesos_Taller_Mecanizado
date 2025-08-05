<template>
  <div class="univo-login-container">
    <div class="univo-login-box">
      <!-- Logo añadido aquí -->
      <div class="univo-logo-container">
        <img src="/src/assets/login.svg" alt="Logo del taller" class="univo-logo">
      </div>
      <form class="univo-form" @submit.prevent="handleLogin">
        <div class="univo-input-group">
          <label class="univo-input-label">Nombre de usuario</label>
          <input 
            type="text" 
            class="univo-input"
            v-model="username"
            required
          >
        </div>
        
        <div class="univo-input-group">
          <label class="univo-input-label">Contraseña</label>
          <input 
            type="password" 
            class="univo-input"
            v-model="password"
            required
          >
        </div>
        
        <div v-if="errorMessage" class="univo-error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="univo-submit-btn" :disabled="loading">
          <span v-if="!loading">Acceder</span>
          <span v-else>Verificando...</span>
        </button>
      </form>
      
      <div class="univo-links">
        <a href="#" class="univo-link">¿Olvidó su contraseña?</a>
      </div>
      
      <div class="univo-footer">
        <span class="univo-language">Español - Internacional (es) ✔</span>
        <span class="univo-cookies">Aviso de Cookies</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/*import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // Aquí deberías reemplazar esto con tu llamada API real
    await authStore.login({
      username: username.value,
      password: password.value
    });

    // Redirección basada en rol
    if (authStore.user?.role === 'coordinator') {
      router.push('/dashboard-coordinador');
    } else if (authStore.user?.role === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/dashboard-operario');
    }
    
  } catch (error) {
    console.error('Error de login:', error);
    errorMessage.value = 'Credenciales incorrectas. Por favor intente nuevamente.';
  } finally {
    loading.value = false;
  }
};*/
</script>