<template>
  <div class="univo-login-container">
    <div class="univo-login-box">
      <h1 class="univo-title">Taller de mecanizado y soldadura</h1>
      
      <form class="univo-form">
        <div class="univo-input-group">
          <label class="univo-input-label">Nombre de usuario</label>
          <input 
            type="text" 
            class="univo-input"
            v-model="username"
          >
        </div>
        
        <div class="univo-input-group">
          <label class="univo-input-label">Contraseña</label>
          <input 
            type="password" 
            class="univo-input"
            v-model="password"
          >
        </div>
        
        <button type="submit" class="univo-submit-btn">Acceder</button>
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

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  }
}
</script>