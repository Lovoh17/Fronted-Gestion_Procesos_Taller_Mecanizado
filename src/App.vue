<template>
  <div class="holy-grail-app">
    <TopBar />

    <div class="content-wrapper">
      <component :is="currentSidebar" />

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

const authStore = useAuthStore();

const currentSidebar = computed(() => {
  return authStore.user?.role === 'coordinator' ? SidebarCoordinator : SideBar;
});
</script>

<style scoped>
.holy-grail-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    margin-top: 50px;
  }
  
  .main-content {
    height: auto;
    min-height: calc(100vh - 50px);
  }
}
</style>