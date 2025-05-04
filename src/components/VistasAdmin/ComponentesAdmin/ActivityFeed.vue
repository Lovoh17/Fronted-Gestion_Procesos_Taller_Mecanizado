<template>
    <div class="activity-feed">
      <div class="feed-header">
        <h3 class="feed-title">Registro de Actividades</h3>
        <div class="feed-actions">
          <button class="btn-refresh" @click="refreshFeed">
            <span class="material-icons">refresh</span>
          </button>
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
        {
          type: 'system',
          message: 'Actualización del sistema completada (v2.4.1)',
          timestamp: new Date(Date.now() - 3600000),
          user: null
        },
        {
          type: 'user',
          message: 'Nuevo pedido creado #ORD-4582',
          timestamp: new Date(Date.now() - 7200000),
          user: 'Juan Pérez'
        },
        {
          type: 'alert',
          message: 'Alerta: Temperatura crítica en máquina CNC-04',
          timestamp: new Date(Date.now() - 10800000),
          user: 'Sistema de monitoreo'
        },
        {
          type: 'user',
          message: 'Reporte mensual generado',
          timestamp: new Date(Date.now() - 14400000),
          user: 'María Gómez'
        },
        {
          type: 'system',
          message: 'Copia de seguridad realizada',
          timestamp: new Date(Date.now() - 18000000),
          user: null
        }
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
  
  <style scoped>
.activity-feed {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.feed-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-dark);
}

.feed-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-refresh {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-medium);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.btn-refresh:hover {
  background: var(--gray-lighter);
  color: var(--gray-dark);
}

.filter-dropdown select {
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--gray-lighter);
  background-color: white;
  color: var(--gray-dark);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
}

.feed-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--gray-medium);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-medium);
  padding: 2rem;
  text-align: center;
}

.empty-state .material-icons {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: var(--transition);
}

.activity-item:hover {
  background: var(--gray-lighter);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-system .activity-icon {
  background: rgba(0, 31, 61, 0.1);
  color: var(--univo-primary);
}

.type-user .activity-icon {
  background: rgba(221, 170, 17, 0.1);
  color: var(--industrial-yellow);
}

.type-alert .activity-icon {
  background: rgba(198, 40, 40, 0.1);
  color: var(--industrial-red);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: 0.9rem;
  color: var(--gray-dark);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  font-size: 0.75rem;
  color: var(--gray-medium);
  display: flex;
  gap: 0.5rem;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .activity-feed {
    background: var(--gray-dark);
  }
  
  .feed-title {
    color: var(--gray-light);
  }
  
  .btn-refresh {
    color: var(--gray-medium);
  }
  
  .btn-refresh:hover {
    background: var(--univo-primary-light);
    color: var(--gray-light);
  }
  
  .filter-dropdown select {
    background: var(--univo-primary-light);
    color: var(--gray-light);
    border-color: var(--univo-primary-light);
  }
  
  .activity-item:hover {
    background: var(--univo-primary);
  }
  
  .activity-message {
    color: var(--gray-light);
  }
  
  .activity-meta {
    color: var(--gray-medium);
  }
  
  .empty-state {
    color: var(--gray-medium);
  }
  
  .type-system .activity-icon {
    background: rgba(27, 63, 100, 0.3);
  }
  
  .type-user .activity-icon {
    background: rgba(221, 170, 17, 0.3);
  }
  
  .type-alert .activity-icon {
    background: rgba(198, 40, 40, 0.3);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .feed-header {
    padding: 0.75rem 1rem;
  }
  
  .activity-item {
    padding: 0.75rem;
  }
  
  .activity-message {
    white-space: normal;
  }
}
</style>
