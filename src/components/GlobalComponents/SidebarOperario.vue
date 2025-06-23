<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Operario</span></span>
      </a>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-title" v-if="!isCollapsed">MENÚ OPERARIO</div>
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
      <button class="logout-btn" @click="handleLogout">
        <span class="material-icons">logout</span>
        <span>Cerrar Sesión</span>
      </button>
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
    const pendingIssues = ref(2) // Ejemplo: 2 problemas pendientes
    
    const navItems = ref([
      { 
        icon: 'assignment', 
        text: 'Mis Trabajos', 
        path: '/operario/trabajos',
        badge: null
      },
      { 
        icon: 'build', 
        text: 'Herramientas', 
        path: '/herramientas',
        badge: null
      },
      { 
        icon: 'warning', 
        text: 'Reportar Problema', 
        path: '/operario/reportes',
        badge: pendingIssues.value
      },
      { 
        icon: 'description', 
        text: 'Mis Reportes', 
        path: '',
        badge: null
      }
    ])
    
    const userName = computed(() => {
      return authStore.user?.name || authStore.user?.username || 'Operario'
    })

    const isRouteActive = (path) => {
      return route.path.startsWith(path)
    }
    
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
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
  background: #e74c3c;
  color: white;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #7f8c8d;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.2);
}

.logout-btn span:first-child {
  margin-right: 8px;
}

/* Estilos para cuando está colapsado */
.sidebar.collapsed .nav-text,
.sidebar.collapsed .nav-title,
.sidebar.collapsed .nav-badge,
.sidebar.collapsed .logo-text,
.sidebar.collapsed .user-info,
.sidebar.collapsed .logout-btn span:last-child {
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

.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 10px 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 0 auto;
}

.sidebar.collapsed .logout-btn span:first-child {
  margin-right: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}
</style>