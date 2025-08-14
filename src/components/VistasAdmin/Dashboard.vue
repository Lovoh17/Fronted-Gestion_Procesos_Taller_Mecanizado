<template>
  <div class="dashboard-layout">
    <Sidebar :role="'admin'" />

    <!-- Contenido Principal del Dashboard -->
    <main class="dashboard-main">
      <!-- Header del Dashboard usando EstiloBase -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-tachometer-alt"></i>
            </div>
            <div class="header-text">
              <h1 class="header-title">Dashboard Administrativo</h1>
              <p class="header-subtitle">Panel de control y gestión del taller de mecanizado</p>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="refresh-button" 
              @click="refreshAllData" 
              :disabled="globalLoading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': globalLoading }"></i>
              Actualizar Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros del Dashboard -->
      <DashboardFilters 
        :available-filters="availableFilters"
        @filter-change="handleFiltersChange"
        @search-change="handleSearchChange"
      />

      <!-- Widgets de Resumen -->
      <SummaryWidgets 
        :key-metrics-data="keyMetrics"
        :active-projects="activeProjects"
        @view-all-projects="handleViewAllProjects"
        @project-selected="handleProjectSelected"
      />

      <!-- Grid principal del dashboard -->
      <div class="dashboard-grid">
        <!-- Gráficos de carga de trabajo -->
        <div class="chart-section">
          <DashboardChart
            title="Tendencia de Carga de Trabajo"
            :chart-type="'area'"
            :chart-series="workloadTrendSeries"
            :chart-options="workloadTrendOptions"
            :loading="chartsLoading"
            :error="chartsError"
            @refresh="refreshWorkloadTrend"
            @retry="retryCharts"
          />
        </div>

        <!-- Widget de capacidad -->
        <div class="capacity-section">
          <CapacityWidget
            :capacity-data="capacityData"
            :workload-by-area="workloadByArea"
            :loading="capacityLoading"
            :error="capacityError"
          />
        </div>
      </div>

      <!-- Segunda fila del grid -->
      <div class="dashboard-grid secondary">
        <!-- Alertas de contratación -->
        <div class="alerts-section">
          <HiringAlerts
            :alerts="hiringAlerts"
            :loading="alertsLoading"
            :error="alertsError"
            @refresh="refreshAlerts"
            @alert-selected="handleAlertSelected"
            @start-hiring="handleStartHiring"
            @view-details="handleViewAlertDetails"
            @retry="retryAlerts"
            @handle-critical="handleCriticalAlerts"
            @plan-hiring="handlePlanHiring"
          />
        </div>

        <!-- Historial de contrataciones -->
        <div class="history-section">
          <ContractHistory
            :contract-history="contractHistory"
            :loading="historyLoading"
            :error="historyError"
            @refresh="refreshHistory"
            @export-data="exportHistoryData"
            @contract-selected="handleContractSelected"
            @view-details="handleViewContractDetails"
            @rehire-employee="handleRehireEmployee"
            @retry="retryHistory"
          />
        </div>
      </div>

      <!-- Carga de trabajo por área (gráfico de barras) -->
      <div class="workload-area-section">
        <DashboardChart
          title="Utilización por Área de Trabajo"
          :chart-type="'bar'"
          :chart-series="workloadByAreaSeries"
          :chart-options="workloadByAreaOptions"
          :loading="chartsLoading"
          :error="chartsError"
          @refresh="refreshWorkloadByArea"
          @retry="retryCharts"
        />
      </div>

      <!-- Estados de carga global -->
      <div v-if="globalLoading && !hasData" class="global-loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>

      <!-- Estado de error global -->
      <div v-if="globalError" class="global-error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error al cargar el dashboard</h3>
        <p>Ha ocurrido un error al cargar los datos del dashboard. Por favor, inténtelo de nuevo.</p>
        <button @click="refreshAllData" class="retry-button">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      </div>

      <!-- Modales -->
      <OrderDetailsModal v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
    </main>
  </div>
</template>

<style scoped>
/* Layout principal */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  overflow-y: auto;
  margin-left: 280px; /* Espacio para sidebar */
}

/* Header del dashboard */
.header-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #003366, #0066CC);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-button {
  background: #003366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-button:hover:not(:disabled) {
  background: #002244;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Grid layouts */
.dashboard-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 400px;
  min-height: 400px;
}

.dashboard-grid.secondary {
  grid-template-columns: 1fr 1fr;
}

.chart-section,
.capacity-section,
.alerts-section,
.history-section {
  height: 100%;
  min-height: 400px;
}

.workload-area-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

/* Estados globales */
.global-loading-container,
.global-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #64748b;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #003366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.global-error-container i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.global-error-container h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.global-error-container p {
  font-size: 1rem;
  margin: 0 0 2rem 0;
  max-width: 400px;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid.secondary {
    grid-template-columns: 1fr;
  }
  
  .capacity-section,
  .alerts-section,
  .history-section {
    min-height: 600px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .header-section {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.875rem;
  }
  
  .dashboard-grid {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 0.75rem;
    gap: 1rem;
  }
  
  .header-section {
    padding: 1rem;
  }
  
  .refresh-button {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
  
  .dashboard-grid {
    gap: 1rem;
  }
}
</style>

<style src="src/assets/EstiloBase.css" scoped></style>
<script>
import Sidebar from '../GlobalComponents/Sidebar.vue';
import OrderDetailsModal from './ComponentesAdmin/OrderDetailsModal.vue';
import DashboardFilters from './ComponentesAdmin/DashboardFilters.vue';
import SummaryWidgets from './ComponentesAdmin/SummaryWidgets.vue';
import DashboardChart from './ComponentesAdmin/DashboardChart.vue';
import CapacityWidget from './ComponentesAdmin/CapacityWidget.vue';
import HiringAlerts from './ComponentesAdmin/HiringAlerts.vue';
import ContractHistory from './ComponentesAdmin/ContractHistory.vue';
import { dashboardService, dashboardMockData } from '../../mock/dashboardData.js';

export default {
  name: 'Dashboard',
  components: {
    Sidebar,
    OrderDetailsModal,
    DashboardFilters,
    SummaryWidgets,
    DashboardChart,
    CapacityWidget,
    HiringAlerts,
    ContractHistory
  },
  data() {
    return {
      // Estados de carga
      globalLoading: false,
      globalError: false,
      chartsLoading: false,
      chartsError: false,
      capacityLoading: false,
      capacityError: false,
      alertsLoading: false,
      alertsError: false,
      historyLoading: false,
      historyError: false,
      
      // Datos del dashboard
      keyMetrics: {},
      activeProjects: [],
      workloadByArea: [],
      workloadTrend: {},
      capacityData: {},
      hiringAlerts: [],
      contractHistory: [],
      
      // Estados de interfaz
      selectedOrder: null,
      currentFilters: {},
      searchQuery: '',
      
      // Configuración de filtros
      availableFilters: dashboardMockData.filters
    };
  },
  computed: {
    hasData() {
      return Object.keys(this.keyMetrics).length > 0 || 
             this.activeProjects.length > 0 || 
             this.workloadByArea.length > 0;
    },
    
    // Series para gráfico de tendencia de carga de trabajo
    workloadTrendSeries() {
      if (!this.workloadTrend.series) return [];
      return this.workloadTrend.series;
    },
    
    // Opciones para gráfico de tendencia
    workloadTrendOptions() {
      return {
        chart: {
          type: 'area',
          stacked: false,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.6,
            opacityTo: 0.1
          }
        },
        xaxis: {
          categories: this.workloadTrend.categories || [],
          title: {
            text: 'Período'
          }
        },
        yaxis: {
          title: {
            text: 'Utilización (%)'
          },
          min: 0,
          max: 100
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "%";
            }
          }
        },
        legend: {
          position: 'top'
        }
      };
    },
    
    // Series para gráfico de carga por área
    workloadByAreaSeries() {
      if (!this.workloadByArea.length) return [];
      return [{
        name: 'Utilización Actual',
        data: this.workloadByArea.map(area => area.current)
      }];
    },
    
    // Opciones para gráfico de barras por área
    workloadByAreaOptions() {
      return {
        chart: {
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val + "%";
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.workloadByArea.map(area => area.area),
          title: {
            text: 'Áreas de Trabajo'
          }
        },
        yaxis: {
          title: {
            text: 'Utilización (%)'
          },
          min: 0,
          max: 100
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      };
    }
  },
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      this.globalLoading = true;
      this.globalError = false;
      
      try {
        await Promise.all([
          this.loadKeyMetrics(),
          this.loadActiveProjects(),
          this.loadWorkloadData(),
          this.loadCapacityData(),
          this.loadHiringAlerts(),
          this.loadContractHistory()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        this.globalError = true;
      } finally {
        this.globalLoading = false;
      }
    },
    
    async loadKeyMetrics() {
      try {
        this.keyMetrics = await dashboardService.getKeyMetrics();
      } catch (error) {
        console.error('Error loading key metrics:', error);
        throw error;
      }
    },
    
    async loadActiveProjects() {
      try {
        this.activeProjects = await dashboardService.getActiveProjects();
      } catch (error) {
        console.error('Error loading active projects:', error);
        throw error;
      }
    },
    
    async loadWorkloadData() {
      this.chartsLoading = true;
      this.chartsError = false;
      
      try {
        const [workloadByArea, workloadTrend] = await Promise.all([
          dashboardService.getWorkloadByArea(),
          dashboardService.getWorkloadTrend()
        ]);
        
        this.workloadByArea = workloadByArea;
        this.workloadTrend = workloadTrend;
      } catch (error) {
        console.error('Error loading workload data:', error);
        this.chartsError = true;
      } finally {
        this.chartsLoading = false;
      }
    },
    
    async loadCapacityData() {
      this.capacityLoading = true;
      this.capacityError = false;
      
      try {
        this.capacityData = await dashboardService.getCapacityWidget();
      } catch (error) {
        console.error('Error loading capacity data:', error);
        this.capacityError = true;
      } finally {
        this.capacityLoading = false;
      }
    },
    
    async loadHiringAlerts() {
      this.alertsLoading = true;
      this.alertsError = false;
      
      try {
        this.hiringAlerts = await dashboardService.getHiringAlerts();
      } catch (error) {
        console.error('Error loading hiring alerts:', error);
        this.alertsError = true;
      } finally {
        this.alertsLoading = false;
      }
    },
    
    async loadContractHistory() {
      this.historyLoading = true;
      this.historyError = false;
      
      try {
        this.contractHistory = await dashboardService.getContractHistory();
      } catch (error) {
        console.error('Error loading contract history:', error);
        this.historyError = true;
      } finally {
        this.historyLoading = false;
      }
    },
    
    // Métodos de actualización
    async refreshAllData() {
      await this.loadInitialData();
    },
    
    async refreshWorkloadTrend() {
      try {
        this.workloadTrend = await dashboardService.getWorkloadTrend();
      } catch (error) {
        console.error('Error refreshing workload trend:', error);
      }
    },
    
    async refreshWorkloadByArea() {
      try {
        this.workloadByArea = await dashboardService.getWorkloadByArea();
      } catch (error) {
        console.error('Error refreshing workload by area:', error);
      }
    },
    
    async refreshAlerts() {
      await this.loadHiringAlerts();
    },
    
    async refreshHistory() {
      await this.loadContractHistory();
    },
    
    // Métodos de manejo de errores
    async retryCharts() {
      await this.loadWorkloadData();
    },
    
    async retryAlerts() {
      await this.loadHiringAlerts();
    },
    
    async retryHistory() {
      await this.loadContractHistory();
    },
    
    // Manejadores de eventos de filtros
    handleFiltersChange(filters) {
      this.currentFilters = filters;
      console.log('Filters changed:', filters);
      // Aquí se implementaría la lógica de filtrado
    },
    
    handleSearchChange(query) {
      this.searchQuery = query;
      console.log('Search query:', query);
      // Aquí se implementaría la lógica de búsqueda
    },
    
    // Manejadores de eventos de proyectos
    handleViewAllProjects() {
      console.log('Navigate to all projects view');
      // Navegación a vista completa de proyectos
    },
    
    handleProjectSelected(project) {
      console.log('Project selected:', project);
      this.selectedOrder = project; // Temporal para mostrar modal
    },
    
    // Manejadores de eventos de alertas
    handleAlertSelected(alert) {
      console.log('Alert selected:', alert);
    },
    
    handleStartHiring(alert) {
      console.log('Start hiring for:', alert);
      // Lógica para iniciar proceso de contratación
    },
    
    handleViewAlertDetails(alert) {
      console.log('View alert details:', alert);
      // Mostrar detalles de la alerta
    },
    
    handleCriticalAlerts() {
      console.log('Handle critical alerts');
      // Gestionar alertas críticas
    },
    
    handlePlanHiring() {
      console.log('Plan hiring');
      // Planificar contrataciones
    },
    
    // Manejadores de eventos del historial
    handleContractSelected(contract) {
      console.log('Contract selected:', contract);
    },
    
    handleViewContractDetails(contract) {
      console.log('View contract details:', contract);
      // Mostrar detalles del contrato
    },
    
    handleRehireEmployee(contract) {
      console.log('Rehire employee:', contract);
      // Lógica para recontratar empleado
    },
    
    exportHistoryData() {
      console.log('Export history data');
      // Lógica para exportar datos del historial
      // Se podría implementar exportación a CSV, Excel, etc.
    }
  }
};
</script>
