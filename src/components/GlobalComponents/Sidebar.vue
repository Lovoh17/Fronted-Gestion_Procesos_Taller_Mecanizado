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
        path: '/admin-dashboard',
        badge: null 
      },
      { 
        icon: 'inventory_2',  
        text: 'Gestión Inventario', 
        path: '/admin/inventory',
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
        icon: 'assessment', 
        text: 'Analíticos', 
        path: '/reports',
        badge: null 
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
    }
    
    const setActiveItem = (index) => {
      activeItem.value = index
    }
    
    // Logo que se mostrará cuando esté colapsado
    const collapsedLogo = ref('logo-mini.png') // Ajusta la ruta de tu logo
    
    return {
      isCollapsed,
      activeItem,
      navItems,
      isRouteActive,
      toggleSidebar,
      setActiveItem,
      collapsedLogo
    }
  }
}
</script>

<style scoped>

</style>