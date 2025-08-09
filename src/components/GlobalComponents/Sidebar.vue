<template>
  <VaSidebar 
    v-model="isCollapsed"
    :width="sidebarWidth"
    :minimized-width="minimizedWidth"
    color="primary"
    class="univo-sidebar"
  >
    <!-- Header -->
    <template #header>
      <VaSidebarItem class="sidebar-header">
        <div class="sidebar-logo" @click="toggleSidebar">
          <VaIcon 
            name="factory" 
            size="2rem"
            color="warning"
            class="sidebar-logo-icon"
          />
          <div v-if="!isCollapsed" class="logo-text">
            UNIVO<span class="logo-accent">Industrial</span>
          </div>
        </div>
        <VaButton 
          preset="plain"
          :icon="isCollapsed ? 'menu' : 'chevron_left'"
          color="secondary"
          size="small"
          class="collapse-button"
          @click="toggleSidebar"
        />
      </VaSidebarItem>
    </template>

    <!-- Content -->
    <template #content>
      <VaSidebarItemGroup>
        <VaSidebarItemTitle v-if="!isCollapsed" class="nav-title">
          MENÚ PRINCIPAL
        </VaSidebarItemTitle>
        
        <VaSidebarItem
          v-for="(item, index) in navItems"
          :key="index"
          :to="item.path"
          :active="isRouteActive(item.path)"
          class="nav-item"
          @click="setActiveItem(index)"
        >
          <template #icon>
            <VaIcon 
              :name="item.icon" 
              size="1.4rem"
              class="nav-icon"
            />
          </template>
          
          <template #default>
            <span class="nav-text">{{ item.text }}</span>
          </template>
          
          <template #append v-if="item.badge && item.badge > 0">
            <VaBadge 
              :text="item.badge.toString()"
              color="danger"
              class="nav-badge"
            />
          </template>
        </VaSidebarItem>
      </VaSidebarItemGroup>
    </template>

    <!-- Footer -->
    <template #footer>
      <VaSidebarItem v-if="!isCollapsed" class="sidebar-footer">
        <div class="company-brand">UNIVO INDUSTRIAL</div>
      </VaSidebarItem>
    </template>
  </VaSidebar>
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
      }
    ])
    
    // Computed properties para las dimensiones del sidebar
    const sidebarWidth = computed(() => '240px')
    const minimizedWidth = computed(() => '80px')
    
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
      sidebarWidth,
      minimizedWidth,
      isRouteActive,
      toggleSidebar,
      setActiveItem
    }
  }
}
</script>

<style scoped>
.univo-sidebar {
  background: linear-gradient(180deg, var(--univo-primary-dark), var(--univo-primary-dark));
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-dark);
}

.sidebar-header {
  padding: 1.8rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
  color: var(--metal-light);
}

.sidebar-logo:hover {
  color: var(--industrial-yellow);
  transform: translateX(3px);
}

.sidebar-logo-icon {
  background: rgba(221, 170, 17, 0.1);
  padding: 8px;
  border-radius: 12px;
  margin-right: 0.8rem;
}

.logo-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--metal-light);
}

.logo-accent {
  color: var(--industrial-yellow);
  font-weight: 700;
}

.collapse-button {
  color: var(--metal-light);
}

.nav-title {
  color: var(--gray-light);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  padding: 0.8rem 0;
  margin-top: 1rem;
}

.nav-item {
  margin: 0.3rem 0;
  border-radius: 8px;
  transition: var(--transition);
}

.nav-item:hover {
  background: rgba(221, 170, 17, 0.1);
  transform: translateX(5px);
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left: 4px solid var(--industrial-yellow);
  font-weight: 500;
}

.nav-icon {
  color: var(--gray-lighter);
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-lighter);
}

.nav-badge {
  background-color: var(--danger);
  color: white;
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

/* Responsive */
@media (max-width: 768px) {
  .univo-sidebar {
    transform: translateX(-100%);
  }
  
  .univo-sidebar:not(.va-sidebar--minimized) {
    transform: translateX(0);
    width: 280px;
  }
}
</style>
