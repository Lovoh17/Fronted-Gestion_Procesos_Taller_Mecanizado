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

        <va-button 
          type="submit" 
          class="register-button" 
          :disabled="isSubmitting"
          :loading="isSubmitting"
          color="primary"
          block
          icon="user-plus"
        >
          {{ isSubmitting ? 'Registrando...' : 'Completar Registro' }}
        </va-button>
      </form>

      <div class="register-footer">
        <p>¿Ya estás registrado? <router-link to="/login" class="register-footer-link">Inicia sesión aquí</router-link></p>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/RegisterForm.js"></script>

<style src="../assets/RegisterForm.css"></style>
