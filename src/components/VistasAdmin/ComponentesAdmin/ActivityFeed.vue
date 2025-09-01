<template>
    <div class="activity-feed">
      <div class="feed-header">
        <h3 class="feed-title">Registro de Actividades</h3>
        <div class="feed-actions">
          <va-button class="btn-refresh" @click="refreshFeed"    >
        
            <span class="material-icons">refresh</span>
          
      </va-button>
          <div class="filter-dropdown">
            <select v-model="filterType" @change="filterActivities">
              <option value="all">Todas</option>
              <option value="system">Sistema</option>
              <option value="user">Usuario</option>
              <option value="alert">Alertas</option>
            </select>
          </div>
        </div>
      </div>
  
      <div class="feed-container">
        <div v-if="loading" class="loading-indicator">
          <span class="material-icons spin">autorenew</span>
        </div>
  
        <div v-else-if="filteredActivities.length === 0" class="empty-state">
          <span class="material-icons">notifications_off</span>
          <p>No hay actividades recientes</p>
        </div>
  
        <div v-else class="activities-list">
          <div 
            v-for="(activity, index) in filteredActivities" 
            :key="index"
            class="activity-item"
            :class="`type-${activity.type}`"
          >
            <div class="activity-icon">
              <span class="material-icons">{{ getActivityIcon(activity.type) }}</span>
            </div>
            <div class="activity-content">
              <div class="activity-message">{{ activity.message }}</div>
              <div class="activity-meta">
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                <span class="activity-user" v-if="activity.user">• {{ activity.user }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  
  export default {
    name: 'ActivityFeed',
    setup() {
      const activities = ref([
        
      ])
  
      const filterType = ref('all')
      const loading = ref(false)
  
      const filteredActivities = computed(() => {
        if (filterType.value === 'all') return activities.value
        return activities.value.filter(act => act.type === filterType.value)
      })
  
      const getActivityIcon = (type) => {
        const icons = {
          system: 'settings',
          user: 'person',
          alert: 'warning'
        }
        return icons[type] || 'notifications'
      }
  
      const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
  
      const refreshFeed = () => {
        loading.value = true
        // Simular carga de datos
        setTimeout(() => {
          loading.value = false
        }, 1000)
      }
  
      const filterActivities = () => {
        // Filtrado manejado por la propiedad computada
      }
  
      onMounted(() => {
        // Ordenar actividades por fecha (más recientes primero)
        activities.value.sort((a, b) => b.timestamp - a.timestamp)
      })
  
      return {
        activities,
        filteredActivities,
        filterType,
        loading,
        getActivityIcon,
        formatTime,
        refreshFeed,
        filterActivities
      }
    }
  }
  </script>
  
  <style >

</style>
