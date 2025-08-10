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

// Mapeo de roles a componentes
const roleSidebars = {
  admin: SideBar,
  coordinator: SidebarCoordinator,
  operator: SidebarOperario,
  technician: SidebarTecnico
};

// Función para determinar el rol basándose en la ruta
const getRoleFromRoute = (currentPath) => {
  // Rutas de administrador
  if (currentPath.startsWith('/admin') ||
    currentPath === '/admin-dashboard' ||
    currentPath === '/inventory' ||
    currentPath === '/herramientas') {
    return 'admin';
  }

  // Rutas de coordinador
  if (currentPath.startsWith('/coordinator') ||
    currentPath === '/dashboard-coordinador' ||
    currentPath === '/control-calidad') {
    return 'coordinator';
  }

  // Rutas de operario
  if (currentPath.startsWith('/operator') ||
    currentPath === '/dashboard-operario' ||
    currentPath.startsWith('/operario')) {
    return 'operator';
  }

  // Rutas de técnico
  if (currentPath.startsWith('/technician') ||
    currentPath === '/tech-dashboard' ||
    currentPath.startsWith('/tech')) {
    return 'technician';
  }

  // Rutas públicas o sin rol específico
  return null;
};

const currentSidebar = computed(() => {
  // Si no está autenticado, no mostrar sidebar
  if (!authStore.isAuthenticated) {
    return null;
  }

  const currentPath = route.path;

  // Primero intentar obtener el rol desde el store de autenticación
  let userRole = authStore.user?.role || authStore.userRole;

  // Si no hay rol en el store, determinar por la ruta
  if (!userRole) {
    userRole = getRoleFromRoute(currentPath);
  }

  // Verificar que el rol coincida con la ruta (opcional, para validación)
  const routeRole = getRoleFromRoute(currentPath);
  if (routeRole && userRole !== routeRole) {
    console.warn('⚠️ El rol del usuario no coincide con la ruta:', {
      userRole,
      routeRole,
      currentPath
    });
    // Puedes decidir si usar el rol del usuario o el de la ruta
    // En este caso, usaremos el de la ruta
    userRole = routeRole;
  }

  console.log('🔄 Current role:', userRole, 'for path:', currentPath);

  const sidebar = roleSidebars[userRole];

  if (!sidebar) {
    console.warn('⚠️ Rol no reconocido:', userRole);
    return null;
  }

  return sidebar;
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
  padding: 1rem;
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