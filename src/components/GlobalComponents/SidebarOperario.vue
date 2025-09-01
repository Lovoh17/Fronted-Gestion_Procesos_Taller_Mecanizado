<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Operario</span></span>
      </a>
      <div class="sidebar-collapse-control" @click="toggleSidebar">
        <i class="material-icons">{{ isCollapsed ? 'menu' : 'chevron_left' }}</i>
      </div>
    </div>
    
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <div class="nav-title" v-if="!isCollapsed">MENÚ OPERARIO</div>
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
            v-if="!isCollapsed && item.badge !== null && item.badge > 0" 
            class="nav-badge"
            :class="{
              'badge-danger': item.badge > 0 && item.badgeType === 'danger',
              'badge-warning': item.badge > 0 && item.badgeType === 'warning',
              'badge-success': item.badge > 0 && item.badgeType === 'success'
            }"
          >
            {{ item.badge }}
          </span>
          <span v-if="isCollapsed && item.badge !== null && item.badge > 0" class="collapsed-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer" v-if="!isCollapsed">
        <!-- Información del usuario desde el store -->
        <div class="user-info" v-if="authStore.isAuthenticated">
          <div class="user-name">{{ authStore.userName || 'Usuario' }}</div>
          <div class="user-role">{{ authStore.userRole || 'Sin rol' }}</div>
        </div>

        <button class="logout-btn" @click="handleLogout">
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
  name: 'OperarioSidebar',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    const activeItem = ref(0)
    const pendingIssues = ref(2) // Ejemplo: 2 problemas pendientes
    
    const navItems = ref([
      { 
        icon: 'assignment', 
        text: 'Mis Trabajos', 
        path: '/operario/trabajos',
        badge: null,
        badgeType: null
      },
      { 
        icon: 'build', 
        text: 'Herramientas', 
        path: '/herramientas',
        badge: null,
        badgeType: null
      },
      { 
        icon: 'warning', 
        text: 'Reportes', 
        path: '/operario/reportes',
        badge: pendingIssues.value,
        badgeType: 'danger'
      },
    ])

    const isRouteActive = (path) => {
      return route.path.startsWith(path)
    }
    
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      localStorage.setItem('operarioSidebarCollapsed', isCollapsed.value)
    }
    
    const setActiveItem = (index) => {
      activeItem.value = index
    }
    
    const handleLogout = async () => {
      try {
        console.log('🚪 [OperarioSidebar] Iniciando proceso de logout...')

        // Usar el método logout del store que ya implementaste
        authStore.logout()

        console.log('✅ [OperarioSidebar] Logout completado, redirigiendo...')

        // Redirigir al login o página principal
        await router.push('/')

      } catch (error) {
        console.error('❌ [OperarioSidebar] Error durante el logout:', error)
        // Aún así intentar redirigir
        await router.push('/')
      }
    }

    // Cargar estado inicial del sidebar
    const loadSidebarState = () => {
      const savedState = localStorage.getItem('operarioSidebarCollapsed')
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
      authStore,
      isRouteActive,
      toggleSidebar,
      setActiveItem,
      handleLogout
    }
  }
}
</script>

<style >
.sidebar {
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, var(--univo-primary-dark) 0%, var(--univo-primary-dark) 100%);
  color: var(--metal-light);
  position: fixed;
  top: 0;
  left: 0;
  transition: var(--transition);
  z-index: 1000;
  box-shadow: var(--shadow-dark);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
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
  min-height: 80px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  color: var(--gray-light);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: var(--transition);
  cursor: pointer;
  white-space: nowrap;
  gap: 12px;
}

.sidebar-logo:hover {
  color: var(--industrial-yellow);
  transform: translateX(3px);
}

.sidebar.collapsed .sidebar-logo:hover {
  transform: translateX(0);
}

.sidebar-logo-icon {
  font-size: 28px;
  color: var(--industrial-yellow);
  background: rgba(221, 170, 17, 0.1);
  padding: 8px;
  border-radius: 12px;
  transition: var(--transition);
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-text span {
  color: var(--industrial-yellow);
  font-weight: 700;
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
  padding: 20px 0 0 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  flex-grow: 1;
}

.nav-title {
  padding: 0.8rem 1.8rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--gray-light);
  letter-spacing: 1.5px;
  margin-bottom: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--metal-light);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  margin: 0.3rem 0.5rem;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
  gap: 12px;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
  margin: 0.3rem 0;
}

.nav-item:hover {
  background: rgba(221, 170, 17, 0.1);
  color: var(--industrial-yellow);
  transform: translateX(5px);
}

.sidebar.collapsed .nav-item:hover {
  transform: translateX(0);
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.2);
  color: var(--industrial-yellow);
  border-left: 4px solid var(--industrial-yellow);
  font-weight: 500;
}

.sidebar.collapsed .nav-item.active {
  border-left: none;
  border-right: 4px solid var(--industrial-yellow);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--gray-lighter);
  min-width: 20px;
  transition: var(--transition);
  flex-shrink: 0;
}

.nav-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-lighter);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  background-color: rgba(0, 0, 0, 0.1);
}

.user-info {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.user-name {
  color: white;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: #e74c3c;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 15px;
}

.logout-btn:hover {
  background-color: rgba(231, 76, 60, 0.2);
  transform: translateY(-2px);
}

.company-brand {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tooltip para iconos cuando está colapsado */
.sidebar.collapsed .nav-item {
  position: relative;
}

.sidebar.collapsed .nav-item:hover::after {
  content: attr(title);
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--univo-primary-dark);
  color: var(--gray-light);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1001;
  box-shadow: var(--shadow-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 1;
  pointer-events: none;
}

.sidebar.collapsed .nav-item:hover::before {
  content: '';
  position: absolute;
  left: 72px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid var(--univo-primary-dark);
  z-index: 1001;
}

/* Scrollbar personalizado */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(221, 170, 17, 0.5);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(221, 170, 17, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
    width: 280px;
  }
}

/* Animaciones suaves */
* {
  box-sizing: border-box;
}

.sidebar * {
  transition: var(--transition);
}
</style>