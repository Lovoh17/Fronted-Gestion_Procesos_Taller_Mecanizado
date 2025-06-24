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
import { useAuthStore } from '@/stores/auth';
import TopBar from '@/components/GlobalComponents/TopBar.vue';

// Importación estándar de los sidebars
import SideBar from '@/components/GlobalComponents/Sidebar.vue';
import SidebarCoordinator from '@/components/GlobalComponents/SidebarCoordinador.vue';
import SidebarOperario from '@/components/GlobalComponents/SidebarOperario.vue';
import SidebarTecnico from '@/components/GlobalComponents/SidebarTecnico.vue';

const authStore = useAuthStore();

// Mapeo de roles a componentes
const roleSidebars = {
  admin: SideBar,
  coordinator: SidebarCoordinator,
  operator: SidebarOperario,
  technician: SidebarTecnico
};

const currentSidebar = computed(() => {
  if (!authStore.isAuthenticated) {
    return null;
  }

  const userRole = authStore.user?.role || authStore.userRole;
  console.log('🔄 Current role:', userRole);
  
  const sidebar = roleSidebars[userRole];
  
  if (!sidebar) {
    console.warn('⚠️ Rol no reconocido:', userRole);
    return null;
  }
  
  return sidebar;
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
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-container {
  flex: 1;
  padding: var(--content-padding);
  overflow-y: auto;
  height: 100%;
}

/* Scrollbar personalizada */
.content-container::-webkit-scrollbar {
  width: 8px;
}

.content-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
  }
  
  .content-container {
    padding: 10px;
    overflow-y: visible;
  }
}
</style>