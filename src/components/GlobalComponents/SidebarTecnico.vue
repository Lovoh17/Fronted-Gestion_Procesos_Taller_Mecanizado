<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" @click.prevent="toggleSidebar">
        <span class="material-icons sidebar-logo-icon">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Industrial</span></span>
      </a>
      <div class="sidebar-collapse-control" @click="toggleSidebar">
        <i class="material-icons">{{ isCollapsed ? 'menu' : 'chevron_left' }}</i>
      </div>
    </div>

    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <div class="nav-title" v-if="!isCollapsed">PANEL TÉCNICO</div>
        <router-link v-for="(item, index) in navItems" :key="index" :to="item.path" class="nav-item"
          :class="{ active: isRouteActive(item.path) }" @click="setActiveItem(index)"
          :title="isCollapsed ? item.text : ''">
          <span class="material-icons icon-wrapper">{{ item.icon }}</span>
          <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
          <span v-if="!isCollapsed && item.badge !== null" class="nav-badge" :class="{
            'badge-danger': item.badge > 0 && item.badgeType === 'danger',
            'badge-warning': item.badge > 0 && item.badgeType === 'warning',
            'badge-success': item.badge > 0 && item.badgeType === 'success'
          }">
            {{ item.badge > 0 ? item.badge : '' }}
          </span>
          <span v-if="isCollapsed && item.badge !== null" class="collapsed-badge">{{ item.badge }}</span>
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
  name: 'TechSidebar',
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
        path: '/tech-dashboard',
        badge: null,
        badgeType: null
      },
      {
        icon: 'schedule',
        text: 'Programación',
        path: '/tech/schedule',
        badge: null,
        badgeType: null
      },
      {
        icon: 'build',
        text: 'Mantenimiento',
        path: '/tech/maintenance',
        badge: 3,
        badgeType: 'danger'
      },
      {
        icon: 'assessment',
        text: 'Reportes',
        path: '/tech/reports',
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

    const handleLogout = async () => {
      try {
        console.log('🚪 [TechSidebar] Iniciando proceso de logout...')

        // Usar el método logout del store que ya implementaste
        authStore.logout()

        console.log('✅ [TechSidebar] Logout completado, redirigiendo...')

        // Redirigir al login o página principal
        await router.push('/')

      } catch (error) {
        console.error('❌ [TechSidebar] Error durante el logout:', error)
        // Aún así intentar redirigir
        await router.push('/')
      }
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
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
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
  font-size: 16px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 20px 0 0 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
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
  white-space: nowrap;
  overflow: hidden;
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
  font-size: 13px;
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
  background-color: rgba(255, 255, 255, 0.2);

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
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
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
  margin-top: 15px;
  padding-bottom: 0;
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