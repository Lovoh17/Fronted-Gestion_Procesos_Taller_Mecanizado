<template>
  <div class="holy-grail-app">
    <TopBar />

    <div class="content-wrapper">
      <component :is="currentSidebar" v-if="authStore.isAuthenticated" />

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import TopBar from '@/components/GlobalComponents/TopBar.vue';

// Importación estándar de los sidebars (opción simple)
import SideBar from '@/components/GlobalComponents/Sidebar.vue';
import SidebarCoordinator from '@/components/GlobalComponents/SidebarCoordinador.vue';
import SidebarOperario from '@/components/GlobalComponents/SidebarOperario.vue';
import SidebarTecnico from '@/components/GlobalComponents/SidebarTecnico.vue';

// Opción con carga diferida (descomentar si se prefiere)
/*
const SideBar = defineAsyncComponent(() => 
  import('@/components/GlobalComponents/Sidebar.vue')
);
const SidebarCoordinator = defineAsyncComponent(() => 
  import('@/components/GlobalComponents/SidebarCoordinador.vue')
);
const SidebarOperario = defineAsyncComponent(() => 
  import('@/components/GlobalComponents/SidebarOperario.vue')
);
const SidebarTecnico = defineAsyncComponent(() => 
  import('@/components/GlobalComponents/SidebarTecnico.vue')
);
*/

const authStore = useAuthStore();

// Mapeo de roles a componentes
const roleSidebars = {
  admin: SideBar,
  coordinator: SidebarCoordinator,
  operator: SidebarOperario,
  technician: SidebarTecnico
};

const currentSidebar = computed(() => {
  return authStore.isAuthenticated 
    ? roleSidebars[authStore.user?.role] || null
    : null;
});
</script>

<style scoped>
:root {
  --header-height: 60px;
  --mobile-header-height: 50px;
  --sidebar-width: 250px;
  --content-padding: 20px;
}

.holy-grail-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
  margin-top: var(--header-height);
}

.main-content {
  flex: 1;
  padding: var(--content-padding);
  overflow-y: auto;
  height: calc(100vh - var(--header-height));
  transition: all 0.3s ease;
}

/* Transición para cambios de ruta */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    margin-top: var(--mobile-header-height);
  }
  
  .main-content {
    height: auto;
    min-height: calc(100vh - var(--mobile-header-height));
    padding: 15px;
  }
}
</style>