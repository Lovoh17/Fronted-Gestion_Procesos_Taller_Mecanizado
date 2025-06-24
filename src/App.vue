<template>
  <div class="holy-grail-app">
    <TopBar />

    <div class="content-wrapper">
      <component :is="currentSidebar" v-if="currentSidebar" />

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import TopBar from '@/components/GlobalComponents/TopBar.vue';
import SideBar from '@/components/GlobalComponents/Sidebar.vue';
import SidebarCoordinator from '@/components/GlobalComponents/SidebarCoordinador.vue';
import SidebarOperario from '@/components/GlobalComponents/SidebarOperario.vue';

const authStore = useAuthStore();

const currentSidebar = computed(() => {
  console.log('🔄 Current role:', authStore.userRole); 
  
  switch(authStore.userRole) { 
    case 'admin':
      return SideBar;
    case 'coordinator':
      return SidebarCoordinator;
    case 'operator':
      return SidebarOperario;
    default:
      console.warn('⚠️ Rol no reconocido:', authStore.userRole);
      return null; 
  }
});
</script>