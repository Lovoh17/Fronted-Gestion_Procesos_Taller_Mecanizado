<template>
<div class="">
    <Sidebar :role="'coordinator'" />
    
    <main class="">
      <div class="top-bar">
        <div class="page-title">
          <h1><i class="fas fa-tasks"></i> Panel de Control Operativo</h1>
          <p class="status-indicator">
            <span class="status-badge production" :class="productionStatus"></span>
          </p>
        </div>
        
        <div class="user-menu">
          <QuickAccessMenu 
            :items="quickActions"
            @action-selected="handleQuickAction"
          />
          
          <UserProfileDropdown 
            :user="currentUser"
            :badge="pendingTasksCount"
          />
        </div>
      </div>

      <!-- Sección principal -->
      <div class="coordinator-dashboard">
        <!-- Widgets superiores -->
        <div class="stats-row">
          <LiveProductionStats 
            :orders="activeOrders"
            :machines="machineStatus"
          />
          
          <UrgentTasksWidget 
            :tasks="pendingTasks"
            @task-click="openTaskDetail"
          />
        </div>

        <!-- Área de trabajo principal -->
        <div class="main-grid">
          <div class="production-section">
            <OrderGanttChart 
              :orders="filteredOrders"
              @order-selected="showOrderDetails"
            />
            
            <MachineStatusGrid 
              :machines="machines"
              @maintenance-request="openMaintenanceForm"
            />
          </div>
          
          <div class="secondary-section">
            <InventoryAlerts 
              :items="lowStockItems"
              @reorder="initReorderProcess"
            />
            
            <QualityChecklist 
              :pending-checks="qualityChecks"
              @complete-check="recordQualityCheck"
            />
          </div>
        </div>
      </div>

      <!-- Modales contextuales -->
      <OrderDetailModal 
        v-if="selectedOrder"
        :order="selectedOrder"
        @close="selectedOrder = null"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Componentes
import Sidebar from '@/components/GlobalComponents/Sidebar.vue'
import LiveProductionStats from '@/components/VistasCoordinador/ComponentesCoordinador/LiveProductionStats.vue'
import OrderGanttChart from '@/components/VistasCoordinador/ComponentesCoordinador/OrderGanttChart.vue'
import MachineStatusGrid from '@/components/VistasCoordinador/ComponentesCoordinador/MachineStatusGrid.vue'


// Data
const selectedOrder = ref(null)
const criticalAlerts = computed(() => productionStore.alerts.filter(a => a.level === 'critical').length)

const productionStatusLabel = computed(() => {
  const statusMap = {
    normal: 'Operación normal',
    delayed: 'Retrasos detectados',
    stopped: 'Producción detenida'
  }
  return statusMap[productionStatus.value] || 'Estado desconocido'
})

// Métodos
const showOrderDetails = (order) => {
  selectedOrder.value = order
}

const openMaintenanceForm = (machine) => {
  // Lógica para formulario de mantenimiento
}
</script>

<style scoped>
.coordinator-dashboard {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1.5rem;
}

.status-badge {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-badge.production {
  background-color: var(--status-color);
}

.production.normal { --status-color: #4CAF50; }
.production.delayed { --status-color: #FFC107; }
.production.stopped { --status-color: #F44336; }

.notification-badge.critical {
  background-color: #F44336;
  color: white;
}
</style>