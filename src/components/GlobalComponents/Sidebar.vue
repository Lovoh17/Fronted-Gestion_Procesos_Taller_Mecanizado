<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo">
        <span class="material-icons sidebar-logo-icon sidebar-collapse-control" @click="toggleSidebar">factory</span>
        <span v-if="!isCollapsed" class="logo-text">UNIVO<span>Industrial</span></span>
      </a>
      <div class="sidebar-collapse-control" @click="toggleSidebar">
        <i class="material-icons">{{ isCollapsed ? 'menu' : 'chevron_left' }}</i>
      </div>
    </div>
    
    <div class="sidebar-content">
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
            v-if="!isCollapsed && item.badge !== null" 
            class="nav-badge"
            :class="{ 'badge-danger': item.badge > 0 }"
          >
            {{ item.badge > 0 ? item.badge : '' }}
          </span>
          <span v-if="isCollapsed && item.badge !== null" class="collapsed-badge">{{ item.badge }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="company-brand">UNIVO INDUSTRIAL</div>
      </div>
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
        path: '/admin-dashboard',
        badge: null 
      },
      { 
        icon: 'inventory_2',  
        text: 'Gestión Inventario', 
        path: '/inventory',
        badge: 3
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
        icon: 'precision_manufacturing',
        text: 'Reportes', 
        path: '/admin/reports',
        badge: 5 
      },
      { 
        icon: 'tune', 
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
      // Opcional: Guardar preferencia en localStorage
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
      isRouteActive,
      toggleSidebar,
      setActiveItem
    }
  }
}
</script>