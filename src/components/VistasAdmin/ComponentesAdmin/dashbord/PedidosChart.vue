<template>
  <div class="pedidos-chart-container">
    <!-- Header del componente -->
    <div class="chart-header">
      <div class="chart-info">
        <h3 class="chart-title">
          <i class="fas fa-chart-bar"></i>
          Estadísticas de Pedidos
        </h3>
        <p class="chart-subtitle">Análisis de pedidos por estado y prioridad</p>
      </div>
      <div class="chart-actions">
        <va-button 
          size="small" 
          color="#003366" 
          icon="refresh" 
          @click="refreshData"
          :loading="loading"
        >
          Actualizar
        </va-button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    </div>

    <!-- Charts Grid -->
    <div v-if="!loading && pedidos.length > 0" class="charts-grid">
      <!-- Gráfico de Estados -->
      <div class="chart-card">
        <div class="card-header">
          <h4 class="card-title">
            <i class="fas fa-tasks"></i>
            Pedidos por Estado
          </h4>
        </div>
        <div class="chart-wrapper">
          <EstadosChart 
            v-if="estadosChartData.labels.length > 0" 
            :chart-data="estadosChartData" 
            :chart-options="doughnutOptions"
          />
        </div>
      </div>

      <!-- Gráfico de Prioridades -->
      <div class="chart-card">
        <div class="card-header">
          <h4 class="card-title">
            <i class="fas fa-exclamation-triangle"></i>
            Pedidos por Prioridad
          </h4>
        </div>
        <div class="chart-wrapper">
          <PrioridadesChart 
            v-if="prioridadesChartData.labels.length > 0" 
            :chart-data="prioridadesChartData" 
            :chart-options="pieOptions"
          />
        </div>
      </div>

      <!-- Gráfico de Timeline -->
      <div class="chart-card chart-full-width">
        <div class="card-header">
          <h4 class="card-title">
            <i class="fas fa-calendar-alt"></i>
            Pedidos por Mes
          </h4>
        </div>
        <div class="chart-wrapper">
          <TimelineChart 
            v-if="timelineChartData.labels.length > 0" 
            :chart-data="timelineChartData" 
            :chart-options="lineOptions"
          />
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="!loading && pedidos.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-chart-line"></i>
      </div>
      <h4 class="empty-title">Sin datos disponibles</h4>
      <p class="empty-description">No hay pedidos registrados para mostrar estadísticas</p>
    </div>

    <!-- Resumen de métricas -->
    <div v-if="!loading && pedidos.length > 0" class="metrics-summary">
      <div class="metric-card">
        <div class="metric-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ totalPedidos }}</span>
          <span class="metric-label">Total Pedidos</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon success">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ pedidosCompletados }}</span>
          <span class="metric-label">Completados</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ pedidosEnProceso }}</span>
          <span class="metric-label">En Proceso</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon danger">
          <i class="fas fa-exclamation"></i>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ pedidosAlta }}</span>
          <span class="metric-label">Prioridad Alta</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

import { Doughnut, Pie, Line } from 'vue-chartjs';
import { pedidoService } from '@/services/pedidoService.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

// Componentes de gráficos personalizados
const EstadosChart = {
  extends: Doughnut,
  props: ['chartData', 'chartOptions']
};

const PrioridadesChart = {
  extends: Pie,
  props: ['chartData', 'chartOptions']
};

const TimelineChart = {
  extends: Line,
  props: ['chartData', 'chartOptions']
};

export default {
  name: 'PedidosChart',
  components: {
    EstadosChart,
    PrioridadesChart,
    TimelineChart
  },
  data() {
    return {
      pedidos: [],
      loading: false,
      // Opciones para los gráficos
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      pieOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      lineOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Pedidos: ${context.parsed.y}`;
              }
            }
          }
        }
      }
    };
  },
  computed: {
    totalPedidos() {
      return this.pedidos.length;
    },
    pedidosCompletados() {
      return this.pedidos.filter(p => p.estado_id === 5).length;
    },
    pedidosEnProceso() {
      return this.pedidos.filter(p => p.estado_id === 3).length;
    },
    pedidosAlta() {
      return this.pedidos.filter(p => p.prioridad === 1).length;
    },
    estadosChartData() {
      const estadosCount = {};
      const estadosLabels = {
        1: 'Pendiente',
        2: 'Aprobado', 
        3: 'En Proceso',
        4: 'Pausado',
        5: 'Completado'
      };

      this.pedidos.forEach(pedido => {
        const estado = estadosLabels[pedido.estado_id] || 'Desconocido';
        estadosCount[estado] = (estadosCount[estado] || 0) + 1;
      });

      return {
        labels: Object.keys(estadosCount),
        datasets: [{
          data: Object.values(estadosCount),
          backgroundColor: [
            '#FF6B6B', // Pendiente - Rojo
            '#4ECDC4', // Aprobado - Verde azulado
            '#45B7D1', // En Proceso - Azul
            '#FFA07A', // Pausado - Naranja claro
            '#98D8C8'  // Completado - Verde
          ],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      };
    },
    prioridadesChartData() {
      const prioridadesCount = {};
      const prioridadesLabels = {
        1: 'Alta',
        2: 'Media',
        3: 'Baja'
      };

      this.pedidos.forEach(pedido => {
        const prioridad = prioridadesLabels[pedido.prioridad] || 'Desconocida';
        prioridadesCount[prioridad] = (prioridadesCount[prioridad] || 0) + 1;
      });

      return {
        labels: Object.keys(prioridadesCount),
        datasets: [{
          data: Object.values(prioridadesCount),
          backgroundColor: [
            '#E74C3C', // Alta - Rojo intenso
            '#F39C12', // Media - Naranja
            '#27AE60'  // Baja - Verde
          ],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      };
    },
    timelineChartData() {
      const monthsCount = {};
      
      this.pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha_solicitud);
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        monthsCount[monthKey] = (monthsCount[monthKey] || 0) + 1;
      });

      const sortedMonths = Object.keys(monthsCount).sort();
      
      return {
        labels: sortedMonths.map(month => {
          const [year, monthNum] = month.split('-');
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        }),
        datasets: [{
          label: 'Pedidos por Mes',
          data: sortedMonths.map(month => monthsCount[month]),
          backgroundColor: 'rgba(0, 51, 102, 0.1)',
          borderColor: '#003366',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#003366',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      };
    }
  },
  async mounted() {
    await this.loadPedidos();
  },
  methods: {
    async loadPedidos() {
      this.loading = true;
      try {
        const response = await pedidoService.getAll();
        this.pedidos = response.data || response || [];
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        this.pedidos = [];
        this.$vaToast.create({
          message: 'Error al cargar los datos de pedidos',
          color: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    async refreshData() {
      await this.loadPedidos();
    }
  }
};
</script>

<style scoped>
.pedidos-chart-container {
  width: 100%;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.chart-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.chart-title i {
  color: #003366;
  font-size: 1.3rem;
}

.chart-subtitle {
  color: #718096;
  font-size: 0.95rem;
  margin: 0;
}

.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #003366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #718096;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.chart-full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #edf2f7);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title i {
  color: #003366;
}

.chart-wrapper {
  padding: 1.5rem;
  height: 250px;
  position: relative;
}

.chart-full-width .chart-wrapper {
  height: 300px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 3rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: #718096;
  margin: 0;
}

.metrics-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metric-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #003366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.metric-icon.success {
  background: #48bb78;
}

.metric-icon.warning {
  background: #ed8936;
}

.metric-icon.danger {
  background: #f56565;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.metric-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .metrics-summary {
    grid-template-columns: 1fr;
  }
  
  .pedidos-chart-container {
    padding: 1rem;
  }
}
</style>