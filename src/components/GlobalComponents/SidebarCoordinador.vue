<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Industrial *coord</span></span>
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
          v-if="!isCollapsed && item.badge !== null && item.badge > 0" 
          class="nav-badge"
        >
          {{ item.badge }}
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
  name: 'Sidebar',
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
        badge: 5
      },
      { 
        icon: 'inventory_2',  
        text: 'Gestión de Inventario', 
        path: '/inventory',
        badge: 3
      },
      { 
        icon: 'inventory_2',  
        text: 'Gestión de Movimientos', 
        path: '/coordinator/movimientos',
        badge: null
      },
      { 
        icon: 'engineering', 
        text: 'Planos', 
        path: '/coordinator/planos-tools',
        badge: null
      },
      { 
        icon: 'assessment', 
        text: 'Reportes', 
        path: '/admin/reports',
        badge: null
      },
      { 
        icon: 'settings', 
        text: 'Configuración', 
        path: '/settings',
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

.sidebar-header {
  padding: 1.8rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
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
}

.sidebar-logo:hover {
  color: var(--industrial-yellow);
  transform: translateX(3px);
}

.logo-text span {
  color: var(--industrial-yellow);
  font-weight: 700;
}

.sidebar-logo-icon {
  font-size: 2rem;
  margin-right: 0.8rem;
  color: var(--industrial-yellow);
  background: rgba(221, 170, 17, 0.1);
  padding: 8px;
  border-radius: 12px;
}

.sidebar-nav {
  padding: 1.5rem 0;
  flex-grow: 1;
}

.nav-title {
  padding: 0.8rem 1.8rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--gray-light);
  letter-spacing: 1.5px;
  margin-top: 0.5rem;
  font-weight: 600;
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
}

.nav-item:hover {
  background: rgba(221, 170, 17, 0.1);
  color: var(--industrial-yellow);
  transform: translateX(5px);
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.2);
  color: var(--industrial-yellow);
  border-left: 4px solid var(--industrial-yellow);
  font-weight: 500;
}

.nav-item .material-icons {
  margin-right: 1rem;
  font-size: 1.4rem;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  color: var(--gray-lighter);
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-lighter);
}

.nav-badge {
  margin-left: auto;
  background-color: var(--danger);
  color: white;
  border-radius: 10px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.company-brand {
  font-size: 0.8rem;
  color: var(--gray-medium);
  text-align: center;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Estilos colapsado */
.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .sidebar-logo span:not(.material-icons),
.sidebar.collapsed .nav-item span:not(.material-icons):not(.nav-badge),
.sidebar.collapsed .nav-title,
.sidebar.collapsed .sidebar-footer {
  display: none;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 1rem;
  margin: 0.3rem 0;
}

.sidebar.collapsed .nav-item .material-icons {
  margin-right: 0;
  font-size: 1.6rem;
}

.sidebar.collapsed .nav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  margin-left: 0;
  padding: 0.15rem 0.4rem;
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

/* Scrollbar */
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
</style>