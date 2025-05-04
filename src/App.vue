<template>
  <div class="holy-grail-app">
    <TopBar />

    <div class="content-wrapper">
      <SideBar />

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import TopBar from '@/components/VistasAdmin/ComponentesAdmin/TopBar.vue';
import SideBar from '@/components/VistasAdmin/ComponentesAdmin/Sidebar.vue';
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