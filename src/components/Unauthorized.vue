<template>
    <div class="error-container unauthorized-container">
      <div class="error-content">
        <div class="error-icon">
          <span class="material-icons">block</span>
        </div>
        <h1 class="error-title">Acceso no autorizado</h1>
        <p class="error-message">
          No tienes permisos para acceder a esta página con tu rol actual.
        </p>
        <div class="error-actions">
          <va-button @click="goBack" class="action-btn back-btn"    >
        
            <span class="material-icons">arrow_back</span> Volver atrás
          
      </va-button>
          <router-link to="/" class="action-btn home-btn">
            <span class="material-icons">home</span> Ir al inicio
          </router-link>
          <va-button v-if="showLogout" @click="logout" class="action-btn logout-btn"    >
        
            <span class="material-icons">logout</span> Cambiar de usuario
          
      </va-button>
        </div>
      </div>
    </div>
  </template>
  
<script src="./scripts/Unauthorized.js"></script>
  
<style  src="../assets/Unauthorized.css"></style>