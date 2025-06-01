<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Industrial</span></span>
      </a>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-title" v-if="!isCollapsed">MENÚ PRINCIPAL</div>
      <router-link 
        v-for="(item, index) in navItems" 
        :key="index" 
        :to="item.path" 
        class="nav-item" 
        :class="{ active: isRouteActive(item.path) }"
        @click="setActiveItem(index)"
      >
        <span class="material-icons icon-wrapper">{{ item.icon }}</span>
        <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
        <span 
          v-if="!isCollapsed && item.badge !== null" 
          class="nav-badge"
          :class="{ 'badge-danger': item.badge > 0 }"
        >
          {{ item.badge > 0 ? item.badge : '' }}
        </span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer" v-if="!isCollapsed">
      <div class="company-brand">UNIVO INDUSTRIAL</div>
    </div>
  </aside>
</template>
  
  <script>
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  
  export default {
    setup() {
      const route = useRoute()
      const isCollapsed = ref(false)
      const activeItem = ref(0)
      
      const navItems = ref([
        { 
          icon: 'dashboard', 
          text: 'Panel Principal', 
          path: '/dashboard-coordinador',
          badge: null
        },
        { 
          icon: 'schedule', 
          text: 'Planificación', 
          path: '/coordinator/planning',
          badge: null
        },
        { 
          icon: 'build', 
          text: 'Órdenes de Trabajo', 
          path: '/coordinator/orders',
          badge: 5,
          badgeType: 'warning'
        },
        { 
          icon: 'inventory_2',  
          text: 'Gestión de Inventario', 
          path: '/inventory',
          badge: 3,
          badgeType: 'danger'
        },
        { 
          icon: 'miscellaneous_services', 
          text: 'Mantenimientos', 
          path: '/coordinator/maintenance',
          badge: 2
        },
        { 
          icon: 'assignment', 
          text: 'Control Calidad', 
          path: '/control-calidad',
          badge: null
        },
        { 
          icon: 'assessment', 
          text: 'Reportes', 
          path: '/reportes',
          badge: null
        },
        { 
          icon: 'settings', 
          text: 'Configuración', 
          path: '/configuracion',
          badge: null
        }
      ])
      
      const isRouteActive = (path) => {
        return route.path.startsWith(path)
      }
      
      const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value
      }
      
      const setActiveItem = (index) => {
        activeItem.value = index
      }
      
      return {
        isCollapsed,
        activeItem,
        navItems,
        isRouteActive,
        toggleSidebar,
        setActiveItem
      }
    }
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    height: 100vh;
    background: #2c3e50;
    color: #ecf0f1;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
  
  .sidebar-header {
    padding: 20px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-logo {
    display: flex;
    align-items: center;
    color: #fff;
    text-decoration: none;
  }
  
  .sidebar-logo-icon {
    font-size: 28px;
    margin-right: 10px;
    color: #3498db;
  }
  
  .logo-text {
    font-weight: bold;
    font-size: 18px;
  }
  
  .logo-text span {
    font-weight: normal;
    color: #bdc3c7;
  }
  
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 15px 0;
  }
  
  .nav-title {
    color: #7f8c8d;
    font-size: 12px;
    text-transform: uppercase;
    padding: 10px 20px;
    letter-spacing: 1px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #bdc3c7;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
  }
  
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  
  .nav-item.active {
    background: rgba(52, 152, 219, 0.2);
    color: #fff;
    border-left: 3px solid #3498db;
  }
  
  .icon-wrapper {
    margin-right: 15px;
    font-size: 22px;
  }
  
  .nav-text {
    flex: 1;
  }
  
  .nav-badge {
    padding: 3px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }
  
  .badge-danger {
    background: #e74c3c;
    color: white;
  }
  
  .badge-warning {
    background: #f39c12;
    color: white;
  }
  
  .sidebar-footer {
    padding: 15px;
    text-align: center;
    font-size: 12px;
    color: #7f8c8d;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .company-brand {
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  /* Estilos para cuando está colapsado */
  .sidebar.collapsed .nav-text,
  .sidebar.collapsed .nav-title,
  .sidebar.collapsed .nav-badge,
  .sidebar.collapsed .logo-text,
  .sidebar.collapsed .company-brand {
    display: none;
  }
  
  .sidebar.collapsed .sidebar-logo-icon {
    margin-right: 0;
  }
  
  .sidebar.collapsed .nav-item {
    justify-content: center;
    padding: 15px 0;
  }
  
  .sidebar.collapsed .icon-wrapper {
    margin-right: 0;
  }
  </style>