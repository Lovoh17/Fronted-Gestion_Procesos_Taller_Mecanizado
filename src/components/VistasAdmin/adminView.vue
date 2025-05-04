<template>
    <div class="dashboard-container">
      <Sidebar />
      
      <main class="main-content">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="page-title">
            <h1>Panel de Control</h1>
            <p>Bienvenido de nuevo, Administrador</p>
          </div>
          
          <div class="user-menu">
            <div class="notification-icon">
              <span class="material-icons">notifications</span>
              <span class="notification-badge">3</span>
            </div>
            
            <div class="user-profile">
              <img src="https://randomuser.me/api/portraits/men/56.jpg" alt="User" class="user-avatar">
              <span class="user-name">John Doe</span>
              <span class="material-icons">arrow_drop_down</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
<script>
import Sidebar from './ComponentesAdmin/Sidebar.vue'  
    export default {
        name: 'DashboardView',
            components: {
            Sidebar,
        },
    }

</script>