<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
      <img src="../assets/login.svg" alt="Logo Taller Industrial" class="login-logo">
        <h4 class="register-subtitle">Registro de nuevo técnico</h4>
      </div>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="register-input-group">
          <label for="name">
            <i class="fas fa-user"></i> Nombre Completo
          </label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder="Ej: Juan Pérez"
          >
        </div>

        <div class="register-input-group">
          <label for="email">
            <i class="fas fa-envelope"></i> Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="tecnico@tallerindustrial.com"
          >
        </div>

        <div class="register-input-group">
          <label for="password">
            <i class="fas fa-lock"></i> Contraseña
          </label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
            placeholder="Mínimo 6 caracteres"
            minlength="6"
          >
        </div>

        <div class="register-input-group">
          <label for="confirmPassword">
            <i class="fas fa-lock"></i> Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            required
            placeholder="Repite tu contraseña"
            minlength="6"
          >
        </div>

        <div v-if="errorMessage" class="register-error">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>

        <button type="submit" class="register-button" :disabled="isSubmitting">
          <i class="fas fa-user-plus"></i> {{ isSubmitting ? 'Registrando...' : 'Completar Registro' }}
        </button>
      </form>

      <div class="register-footer">
        <p>¿Ya estás registrado? <router-link to="/login" class="register-footer-link">Inicia sesión aquí</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  // Validación de contraseñas
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }
  
  // Validación de longitud mínima
  if (formData.value.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Simulación de registro
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirección después de registro exitoso
    router.push({ name: 'Login' })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al registrar. Por favor intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>