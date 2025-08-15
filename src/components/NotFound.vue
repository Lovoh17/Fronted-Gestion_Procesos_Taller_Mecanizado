<template>
    <div class="notfound-page">
      <div class="content">
        <div class="icon">
          <span class="material-icons">search_off</span>
        </div>
        <h1>Página no encontrada</h1>
        <p>La página que estás buscando no existe o ha sido movida.</p>
        
        <div class="details" v-if="currentPath">
          <p><strong>Ruta solicitada:</strong> {{ currentPath }}</p>
        </div>
        
        <div class="actions">
          <va-button 
            @click="goBack" 
            class="btn back"
            color="secondary"
            icon="arrow_back"
          >
            Volver atrás
          </va-button>
          <router-link to="/" class="btn home">
            <span class="material-icons">home</span> Ir al inicio
          </router-link>
          <router-link v-if="isAuthenticated" to="/dashboard" class="btn dashboard">
            <span class="material-icons">dashboard</span> Ir al dashboard
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
<script src="./scripts/NotFound.js"></script>

<style src="src/assets/NotFound.css" ></style>
