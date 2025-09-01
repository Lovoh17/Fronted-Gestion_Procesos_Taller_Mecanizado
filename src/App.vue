<template>
  <div class="holy-grail-app">
    <TopBar v-if="shouldShowTopBar" />

    <div class="content-wrapper">
      <!-- Sidebar unificado - usa currentSidebar para todos los usuarios -->
      <component :is="currentSidebar" v-if="shouldShowSidebar && currentSidebar" />

      <main class="main-content" :class="{ 'no-sidebar': !shouldShowSidebar }">
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

// Importación estándar de los sidebars - verificar nombres exactos
import AdminSidebar from '@/components/GlobalComponents/Sidebar.vue';
import SidebarCoordinator from '@/components/GlobalComponents/SidebarCoordinador.vue';
import SidebarOperario from '@/components/GlobalComponents/SidebarOperario.vue';
import SidebarTecnico from '@/components/GlobalComponents/SidebarTecnico.vue';

const authStore = useAuthStore();
const route = useRoute();

// Computed para determinar si mostrar TopBar
const shouldShowTopBar = computed(() => {
  // Ocultar en rutas con layout 'empty' o rutas públicas específicas
  if (route.meta?.layout === 'empty') return false
  if (route.path === '/login' || route.path === '/') return false

  return authStore.isAuthenticated
})

// Computed para determinar si mostrar Sidebar
const shouldShowSidebar = computed(() => {
  console.log('🔍 [App.vue] Evaluando shouldShowSidebar...')
  console.log('🔍 [App.vue] isAuthenticated:', authStore.isAuthenticated)
  console.log('🔍 [App.vue] route.path:', route.path)
  console.log('🔍 [App.vue] route.meta:', route.meta)
  console.log('🔍 [App.vue] route.name:', route.name)

  // No mostrar sidebar si no está autenticado
  if (!authStore.isAuthenticated) {
    console.log('🔍 [App.vue] ❌ No mostrar - usuario no autenticado')
    return false
  }

  // No mostrar en rutas con layout 'empty'
  if (route.meta?.layout === 'empty') {
    console.log('🔍 [App.vue] ❌ No mostrar - layout empty detectado')
    return false
  }

  // No mostrar en rutas específicas
  const noSidebarRoutes = ['/login', '/', '/unauthorized', '/not-found']
  if (noSidebarRoutes.includes(route.path)) {
    console.log('🔍 [App.vue] ❌ No mostrar - ruta en lista negra:', route.path)
    return false
  }

  console.log('🔍 [App.vue] ✅ Mostrar sidebar - condiciones generales cumplidas')
  return true
})

// Computed para determinar qué sidebar mostrar según el puesto_id
const currentSidebar = computed(() => {
  console.log('🔋 [App.vue] Evaluando sidebar...');
  console.log('🔋 [App.vue] shouldShowSidebar:', shouldShowSidebar.value);

  // Si no debe mostrar sidebar, retornar null
  if (!shouldShowSidebar.value) {
    console.log('🔋 [App.vue] ❌ No debe mostrar sidebar según shouldShowSidebar');
    return null;
  }

  // Si no hay usuario, retornar null
  if (!authStore.user) {
    console.log('🔋 [App.vue] ❌ No hay datos de usuario en el store');
    return null;
  }

  // Obtener puesto_id del getter reactivo del store
  const puestoId = authStore.userPuestoId;
  const userRole = authStore.userRole;

  console.log('🔋 [App.vue] Usuario completo:', authStore.user);
  console.log('🔋 [App.vue] Puesto ID (reactivo):', puestoId, '(tipo:', typeof puestoId, ')');
  console.log('🔋 [App.vue] Rol del usuario:', userRole);
  console.log('🔋 [App.vue] Ruta actual:', route.path);

  if (!puestoId || isNaN(puestoId)) {
    console.log('🔋 [App.vue] ⚠️ No se encontró puesto_id válido, usando role como fallback');

    const roleToSidebar = {
      'jefe_taller': AdminSidebar,
      'coordinador': SidebarCoordinator,
      'operario': SidebarOperario,
      'tecnico': SidebarTecnico
    };

    const fallbackSidebar = roleToSidebar[userRole];
    if (fallbackSidebar) {
      console.log('🔋 [App.vue] Sidebar seleccionado por role:', userRole);
      return fallbackSidebar;
    }

    console.log('🔋 [App.vue] ⚠️ No se encontró role válido, usando sidebar por defecto');
    return AdminSidebar;
  }

  let selectedSidebar;

  switch (puestoId) {
    case 1: // Jefe de Taller
      selectedSidebar = AdminSidebar;
      console.log('🔋 [App.vue] ✅ Sidebar seleccionado: Admin/Jefe de Taller (puesto_id: 1)');
      console.log('🔋 [App.vue] 📦 Componente AdminSidebar:', AdminSidebar);
      break;
    case 2: // Coordinador
      selectedSidebar = SidebarCoordinator;
      console.log('🔋 [App.vue] ✅ Sidebar seleccionado: Coordinador (puesto_id: 2)');
      console.log('🔋 [App.vue] 📦 Componente SidebarCoordinator:', SidebarCoordinator);
      break;
    case 3: // Operario
      selectedSidebar = SidebarOperario;
      console.log('🔋 [App.vue] ✅ Sidebar seleccionado: Operario (puesto_id: 3)');
      console.log('🔋 [App.vue] 📦 Componente SidebarOperario:', SidebarOperario);
      break;
    case 4: // Técnico
      selectedSidebar = SidebarTecnico;
      console.log('🔋 [App.vue] ✅ Sidebar seleccionado: Técnico (puesto_id: 4)');
      console.log('🔋 [App.vue] 📦 Componente SidebarTecnico:', SidebarTecnico);
      break;
    default:
      selectedSidebar = AdminSidebar;
      console.log('🔋 [App.vue] ⚠️ Puesto ID no reconocido:', puestoId, '- usando sidebar por defecto');
      console.log('🔋 [App.vue] 📦 Componente por defecto:', AdminSidebar);
  }

  console.log('🔋 [App.vue] 🎯 RESULTADO FINAL - Sidebar a renderizar:', selectedSidebar);
  return selectedSidebar;
});
</script>

<style >
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

.main-content.no-sidebar {
  width: 100%;
}

.content-container {
  padding: 1rem 0rem;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>