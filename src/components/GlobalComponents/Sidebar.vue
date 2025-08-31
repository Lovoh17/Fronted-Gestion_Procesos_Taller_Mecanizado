<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span> Admin</span></span>
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
        :title="isCollapsed ? item.text : ''"
      >
        <span class="material-icons icon-wrapper">{{ item.icon }}</span>
        <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
        <span 
          v-if="!isCollapsed && item.badge !== null && item.badge > 0" 
          class="nav-badge"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer" v-if="!isCollapsed">
      <va-button class="logout-btn" @click="handleLogout">
        <span class="material-icons">logout</span>
        <span>Cerrar Sesión</span>
      </va-button>
    </div>
  </aside>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AdminSidebar',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    const activeItem = ref(0)
    
    const navItems = ref([
      {
        icon: 'dashboard',
        text: 'Panel Principal',
        path: '/admin-dashboard',
        badge: null
      },
      {
        icon: 'inventory_2',
        text: 'Gestión Inventario',
        path: '/inventory',
        badge: null
      },
      {
        icon: 'miscellaneous_services',
        text: 'Departamentos',
        path: '/admin/departments',
        badge: null
      },
      {
        icon: 'account_balance',
        text: 'Transacciones',
        path: '/admin/transacciones',
        badge: null
      },
      {
        icon: 'handyman',
        text: 'Herramientas',
        path: '/herramientas',
        badge: null
      },
      {
        icon: 'local_shipping',
        text: 'Ordenes',
        path: '/admin/orders',
        badge: null
      },
      {
        icon: 'groups',
        text: 'Usuarios',
        path: '/admin/users',
        badge: null
      },
      {
        icon: 'tune',
        text: 'Configuración',
        path: '/settings',
        badge: null
      },
      {
        icon: 'people',
        text: 'RRHH',
        path: '/rrhh',
        badge: null
      }
    ])
    
    const userName = computed(() => {
      return authStore.user?.name || authStore.user?.username || 'Administrador'
    })

    const isRouteActive = (path) => {
      return route.path.startsWith(path)
    }
    
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      // Guardar preferencia en localStorage
      localStorage.setItem('sidebarCollapsed', isCollapsed.value)
    }
    
    const setActiveItem = (index) => {
      activeItem.value = index
    }
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
    
    // Cargar estado inicial del sidebar
    const loadSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
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
      isRouteActive,
      toggleSidebar,
      setActiveItem,
      handleLogout
    }
  }
}
</script>

<style scoped>
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.8rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  min-height: 80px;
}

.sidebar.collapsed .sidebar-header {
  padding: 1.8rem 0;
  justify-content: center;
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
}

.sidebar-logo:hover {
  color: var(--industrial-yellow);
  transform: translateX(3px);
}

.sidebar.collapsed .sidebar-logo:hover {
  transform: translateX(0);
}

.sidebar-logo-icon {
  font-size: 2rem;
  margin-right: 0.8rem;
  color: var(--industrial-yellow);
  background: rgba(221, 170, 17, 0.1);
  padding: 8px;
  border-radius: 12px;
  transition: var(--transition);
}

.sidebar.collapsed .sidebar-logo-icon {
  margin-right: 0;
}

.logo-text {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.logo-text span {
  color: var(--industrial-yellow);
  font-weight: 700;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-nav {
  padding: 1.5rem 0;
  flex-grow: 1;
  overflow-x: hidden;
}

.nav-title {
  padding: 0.8rem 1.8rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--gray-light);
  letter-spacing: 1.5px;
  margin-top: 0.5rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-title {
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.9rem 1.8rem;
  color: var(--metal-light);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  margin: 0.3rem 0.5rem;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 1rem;
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
  font-size: 1.4rem;
  color: var(--gray-lighter);
  min-width: 24px;
  transition: var(--transition);
  flex-shrink: 0;
}

.sidebar.collapsed .icon-wrapper {
  font-size: 1.6rem;
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-lighter);
  margin-left: 1rem;
  opacity: 1;
  transition: opacity 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  margin-left: 0;
}

.nav-badge {
  margin-left: auto;
  background-color: var(--danger);
  color: white;
  border-radius: 10px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  margin-left: 0;
  padding: 0.15rem 0.4rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .sidebar-footer {
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
  border-top: none;
}

.user-info {
  margin-bottom: 1rem;
  text-align: center;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-light);
  margin-bottom: 0.2rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--industrial-yellow);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: var(--danger);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: translateY(-2px);
}

.logout-btn .material-icons {
  margin-right: 0.8rem;
  font-size: 1.2rem;
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
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
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