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
          <button @click="goBack" class="action-btn back-btn">
            <span class="material-icons">arrow_back</span> Volver atrás
          </button>
          <router-link to="/" class="action-btn home-btn">
            <span class="material-icons">home</span> Ir al inicio
          </router-link>
          <button v-if="showLogout" @click="logout" class="action-btn logout-btn">
            <span class="material-icons">logout</span> Cambiar de usuario
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { computed } from 'vue';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const showLogout = computed(() => !!authStore.user);
  
  const goBack = () => {
    router.go(-1);
  };
  
  const logout = () => {
    authStore.logout();
    router.push('/login');
  };
  </script>
  
  <style scoped>
  .unauthorized-container {
    background-color: #fff8f8;
    border-left: 6px solid #ff5252;
  }
  
  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
    text-align: center;
  }
  
  .error-content {
    max-width: 500px;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .error-icon {
    font-size: 72px;
    color: #ff5252;
    margin-bottom: 20px;
  }
  
  .error-title {
    color: #d32f2f;
    margin-bottom: 15px;
    font-size: 28px;
  }
  
  .error-message {
    color: #555;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .error-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }
  
  .action-btn span {
    margin-right: 8px;
  }
  
  .back-btn {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .back-btn:hover {
    background-color: #e0e0e0;
  }
  
  .home-btn {
    background-color: #1976d2;
    color: white;
    text-decoration: none;
  }
  
  .home-btn:hover {
    background-color: #1565c0;
  }
  
  .logout-btn {
    background-color: #ff5252;
    color: white;
  }
  
  .logout-btn:hover {
    background-color: #d32f2f;
  }
  
  @media (max-width: 600px) {
    .error-content {
      padding: 20px;
    }
    
    .error-actions {
      flex-direction: column;
    }
    
    .action-btn {
      justify-content: center;
    }
  }
  </style>