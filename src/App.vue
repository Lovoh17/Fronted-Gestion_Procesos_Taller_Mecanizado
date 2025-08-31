<template>
  <div class="holy-grail-app">
    <TopBar />
    
    <div class="content-wrapper">
      <component :is="currentSidebar" v-if="authStore.isAuthenticated && currentSidebar" />
      <main class="main-content">
        <div class="content-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import TopBar from '@/components/GlobalComponents/TopBar.vue';

// Importación estándar de los sidebars
import SideBar from '@/components/GlobalComponents/Sidebar.vue';
import SidebarCoordinator from '@/components/GlobalComponents/SidebarCoordinador.vue';
import SidebarOperario from '@/components/GlobalComponents/SidebarOperario.vue';
import SidebarTecnico from '@/components/GlobalComponents/SidebarTecnico.vue';

const authStore = useAuthStore();
const route = useRoute();

// Computed property para determinar qué sidebar mostrar según el puesto_id
const currentSidebar = computed(() => {
  console.log('📋 [App.vue] Evaluando sidebar...');
  
  if (!authStore.isAuthenticated) {
    console.log('📋 [App.vue] Usuario no autenticado');
    return null;
  }

  // Verificar si hay datos de usuario
  if (!authStore.user) {
    console.log('📋 [App.vue] No hay datos de usuario');
    return null;
  }

  // Obtener puesto_id desde diferentes fuentes posibles
  let puestoId;
  
  if (authStore.user.puesto_id) {
    puestoId = parseInt(authStore.user.puesto_id);
  } else {
    // Fallback: intentar obtener desde localStorage
    const storedPuestoId = localStorage.getItem('userPuesto');
    if (storedPuestoId) {
      puestoId = parseInt(storedPuestoId);
      console.log('📋 [App.vue] Puesto ID obtenido desde localStorage:', puestoId);
    }
  }

  const userRole = authStore.userRole || authStore.user.role;
  
  console.log('📋 [App.vue] Usuario:', authStore.user);
  console.log('📋 [App.vue] Puesto ID:', puestoId, '(tipo:', typeof puestoId, ')');
  console.log('📋 [App.vue] Rol del usuario:', userRole);
  
  // Si no hay puesto_id, intentar mapear por role como fallback
  if (!puestoId || isNaN(puestoId)) {
    console.log('📋 [App.vue] ⚠️ No se encontró puesto_id válido, usando role como fallback');
    
    // Mapeo role -> puesto_id como fallback
    const roleToSidebar = {
      'jefe_taller': SideBar,
      'coordinador': SidebarCoordinator,
      'operario': SidebarOperario,
      'tecnico': SidebarTecnico
    };

    const fallbackSidebar = roleToSidebar[userRole];
    if (fallbackSidebar) {
      console.log('📋 [App.vue] Sidebar seleccionado por role:', userRole);
      return fallbackSidebar;
    }
  }

  let selectedSidebar;
  
  switch (puestoId) {
    case 1: // Jefe de Taller
      selectedSidebar = SideBar;
      console.log('📋 [App.vue] Sidebar seleccionado: Admin/Jefe de Taller (puesto_id: 1)');
      break;
    case 2: // Coordinador
      selectedSidebar = SidebarCoordinator;
      console.log('📋 [App.vue] Sidebar seleccionado: Coordinador (puesto_id: 2)');
      break;
    case 3: // Operario
      selectedSidebar = SidebarOperario;
      console.log('📋 [App.vue] Sidebar seleccionado: Operario (puesto_id: 3)');
      break;
    case 4: // Técnico
      selectedSidebar = SidebarTecnico;
      console.log('📋 [App.vue] Sidebar seleccionado: Técnico (puesto_id: 4)');
      break;
    default:
      selectedSidebar = SideBar;
      console.log('📋 [App.vue] Sidebar seleccionado: Por defecto (Admin)');
      console.log('📋 [App.vue] ⚠️ Puesto ID no reconocido:', puestoId);
  }
  
  return selectedSidebar;
});
</script>

<style scoped>
.holy-grail-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.content-container {
  padding: 1rem 0rem;
}

/* Transiciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>