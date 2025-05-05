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
          <button @click="goBack" class="btn back">
            <span class="material-icons">arrow_back</span> Volver atrás
          </button>
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
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  
  const router = useRouter();
  const route = useRoute();
  const currentPath = ref('');
  const isAuthenticated = ref(false);
  
  // Simulación de verificación de autenticación sin depender del store
  onMounted(() => {
    currentPath.value = route.path;
    // Verificación simple de autenticación (puedes personalizar esto)
    isAuthenticated.value = localStorage.getItem('authToken') !== null;
  });
  
  const goBack = () => {
    if (window.history.length > 1) {
      router.go(-1);
    } else {
      router.push('/');
    }
  };
  </script>
  
  <style scoped>
  .notfound-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    padding: 20px;
    box-sizing: border-box;
    z-index: 1000;
  }
  
  .content {
    max-width: 500px;
    width: 100%;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-left: 6px solid #2196f3;
  }
  
  .icon {
    font-size: 72px;
    color: #2196f3;
    margin-bottom: 20px;
  }
  
  h1 {
    color: #1976d2;
    margin-bottom: 15px;
    font-size: 28px;
  }
  
  p {
    color: #555;
    margin-bottom: 20px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .details {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 30px;
    font-size: 14px;
  }
  
  .details p {
    margin: 5px 0;
  }
  
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    border: none;
  }
  
  .btn span {
    margin-right: 8px;
  }
  
  .back {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .back:hover {
    background-color: #e0e0e0;
  }
  
  .home {
    background-color: #1976d2;
    color: white;
  }
  
  .home:hover {
    background-color: #1565c0;
  }
  
  .dashboard {
    background-color: #4caf50;
    color: white;
  }
  
  .dashboard:hover {
    background-color: #388e3c;
  }
  
  @media (max-width: 600px) {
    .content {
      padding: 20px;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  </style>