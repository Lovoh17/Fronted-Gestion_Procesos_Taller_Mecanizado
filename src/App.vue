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
  if (!authStore.isAuthenticated || !authStore.user) {
    return null;
  }

  const puestoId = authStore.user.puesto_id;
  console.log('Puesto ID:', puestoId); // Depuración para verificar el puesto_id
  switch (puestoId) {
    case 1: // Jefe de Taller
      return SideBar; // Sidebar principal para jefe de taller
    case 2: // Coordinador
      return SidebarCoordinator;
    case 3: // Operario
      return SidebarOperario;
    case 4: // Técnico
      return SidebarTecnico;
    default:
      // Si no hay un puesto_id reconocido, mostrar sidebar por defecto
      return SideBar;
  }
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>