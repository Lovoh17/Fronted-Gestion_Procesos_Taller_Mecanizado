<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo">
        <span class="material-icons sidebar-logo-icon sidebar-collapse-control" @click="toggleSidebar">build</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Técnico</span></span>
      </a>
      <div class="sidebar-collapse-control" @click="toggleSidebar">
        <i class="material-icons">{{ isCollapsed ? 'menu' : 'chevron_left' }}</i>
      </div>
    </div>
    
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <div class="nav-title" v-if="!isCollapsed">PANEL TÉCNICO</div>
        <router-link 
          v-for="(item, index) in navItems" 
          :key="index" 
          :to="item.path" 
          class="nav-item" 
          :class="{ active: isRouteActive(item.path) }"
          @click="setActiveItem(index)"
          :title="isCollapsed ? item.text : ''"
        >
          <span class="material-icons icon-wrapper">{{ item.icon }}</span>
          <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
          <span 
            v-if="!isCollapsed && item.badge !== null" 
            class="nav-badge"
            :class="{ 
              'badge-danger': item.badge > 0 && item.badgeType === 'danger',
              'badge-warning': item.badge > 0 && item.badgeType === 'warning',
              'badge-success': item.badge > 0 && item.badgeType === 'success'
            }"
          >
            {{ item.badge > 0 ? item.badge : '' }}
          </span>
          <span v-if="isCollapsed && item.badge !== null" class="collapsed-badge">{{ item.badge }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer" v-if="!isCollapsed">
        <button class="logout-btn" @click="logout">
          <span class="material-icons">logout</span>
          Cerrar Sesión
        </button>
        <div class="company-brand">UNIVO INDUSTRIAL</div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    const activeItem = ref(0)
    
    // Datos del usuario (pueden venir del store de autenticación)
    const userName = ref('Operario de Producción')
    const userRole = ref('Operario')
    
    const navItems = ref([
      { 
        icon: 'dashboard', 
        text: 'Panel Principal', 
        path: '/tech-dashboard',
        badge: null,
        badgeType: null
      },
      { 
        icon: 'assignment',  
        text: 'Órdenes de Trabajo', 
        path: '/tech/work-orders',
        badge: 5,
        badgeType: 'danger'
      },
      { 
        icon: 'engineering', 
        text: 'Mantenimientos', 
        path: '/tech/maintenance',
        badge: 3,
        badgeType: 'warning'
      },
      { 
        icon: 'report_problem', 
        text: 'Reportes de Fallas', 
        path: '/tech/fault-reports',
        badge: 2,
        badgeType: 'danger'
      },
      { 
        icon: 'precision_manufacturing', 
        text: 'Equipos Asignados', 
        path: '/tech/assigned-equipment',
        badge: 12,
        badgeType: 'success'
      },
      { 
        icon: 'schedule', 
        text: 'Programación', 
        path: '/tech/schedule',
        badge: null,
        badgeType: null
      },
      { 
        icon: 'settings', 
        text: 'Configuración', 
        path: '/tech/settings',
        badge: null,
        badgeType: null
      }
    ])
    
    const isRouteActive = (path) => {
      return route.path.startsWith(path)
    }
    
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      localStorage.setItem('techSidebarCollapsed', isCollapsed.value)
    }
    
    const setActiveItem = (index) => {
      activeItem.value = index
    }
    
    const logout = () => {
      authStore.logout()
      router.push('/')
    }
    
    // Cargar estado inicial del sidebar
    const loadSidebarState = () => {
      const savedState = localStorage.getItem('techSidebarCollapsed')
      if (savedState !== null) {
        isCollapsed.value = savedState === 'true'
      }
    }
    
    // Cargar estado al iniciar
    loadSidebarState()
    
    return {
      isCollapsed,
      activeItem,
      navItems,
      userName,
      userRole,
      isRouteActive,
      toggleSidebar,
      setActiveItem,
      logout
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  gap: 12px;
}

.sidebar-logo-icon {
  font-size: 28px;
  color: #ffd700;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.logo-text span {
  color: #ffd700;
  font-weight: normal;
}

.sidebar-collapse-control {
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-collapse-control:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  padding: 20px 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-title {
  color: #ffd700;
  font-size: 12px;
  font-weight: bold;
  margin: 0 20px 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  gap: 12px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border-right: 3px solid #ffd700;
}

.icon-wrapper {
  font-size: 20px;
  min-width: 20px;
}

.nav-text {
  font-size: 14px;
  flex: 1;
}

.nav-badge {
  background-color: #dc3545;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
}

.nav-badge.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.nav-badge.badge-success {
  background-color: #28a745;
}

.collapsed-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.sidebar-footer {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  margin-bottom: 15px;
}

.user-name {
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 15px;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.company-brand {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Scrollbar personalizado */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.5);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}
</style>