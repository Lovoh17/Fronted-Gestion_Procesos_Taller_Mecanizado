<template>
  <div class="dashboard-layout">
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
            <VaButton class="refresh-button" @click="refreshAllData" :disabled="globalLoading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': globalLoading }"></i>
              Actualizar Dashboard
            </VaButton>
          </div>
        </div>
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

      <!-- Dashboard Content -->
      <div v-if="!globalLoading || hasData" class="dashboard-content">
        <!-- Cards de Resumen -->
        <div class="stats-overview">
          <div class="stats-grid">
            <div class="stat-card usuarios">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardData.usuarios?.total || 0 }}</div>
                <div class="stat-label">Total Usuarios</div>
              </div>
            </div>

            <div class="stat-card pedidos">
              <div class="stat-icon">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardData.pedidos?.total || 0 }}</div>
                <div class="stat-label">Total Pedidos</div>
              </div>
            </div>

            <div class="stat-card herramientas">
              <div class="stat-icon">
                <i class="fas fa-tools"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardData.herramientas?.total || 0 }}</div>
                <div class="stat-label">Total Herramientas</div>
              </div>
            </div>

            <div class="stat-card disponibles">
              <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ herramientasDisponibles }}</div>
                <div class="stat-label">Herramientas Disponibles</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-grid">
            <!-- Usuarios por Puesto -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>
                  <i class="fas fa-user-tie"></i>
                  Distribución de Usuarios por Puesto
                </h3>
              </div>
              <div class="chart-container">
                <canvas ref="usuariosPuestoChart"></canvas>
              </div>
            </div>

            <!-- Pedidos por Estado -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>
                  <i class="fas fa-clipboard-list"></i>
                  Estado de Pedidos
                </h3>
              </div>
              <div class="chart-container">
                <canvas ref="pedidosEstadoChart"></canvas>
              </div>
            </div>

            <!-- Herramientas por Estado -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>
                  <i class="fas fa-wrench"></i>
                  Estado de Herramientas
                </h3>
              </div>
              <div class="chart-container">
                <canvas ref="herramientasEstadoChart"></canvas>
              </div>
            </div>

            <!-- Resumen General (Doughnut) -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>
                  <i class="fas fa-chart-pie"></i>
                  Resumen General
                </h3>
              </div>
              <div class="chart-container">
                <canvas ref="resumenGeneralChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalles en Tablas -->
        <div class="details-section">
          <div class="details-grid">
            <!-- Detalle Usuarios -->
            <div class="detail-card">
              <div class="detail-header">
                <h3>
                  <i class="fas fa-users-cog"></i>
                  Detalle de Usuarios por Puesto
                </h3>
              </div>
              <div class="detail-content">
                <div v-for="puesto in dashboardData.usuarios?.porPuesto || []" :key="puesto.puesto_id"
                  class="detail-item">
                  <div class="detail-info">
                    <span class="detail-name">{{ puesto.puesto.nombre_puesto }}</span>
                    <span class="detail-count">: {{ puesto.total }} usuarios</span>
                  </div>
                  <div class="detail-bar">
                    <div class="bar-fill" :style="{ width: (puesto.total / dashboardData.usuarios.total * 100) + '%' }">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalle Pedidos -->
            <div class="detail-card">
              <div class="detail-header">
                <h3>
                  <i class="fas fa-tasks"></i>
                  Detalle de Estados de Pedidos
                </h3>
              </div>
              <div class="detail-content">
                <div v-for="estado in dashboardData.pedidos?.porEstado || []" :key="estado.estado_id"
                  class="detail-item">
                  <div class="detail-info">
                    <span class="detail-name">{{ estado.estados_pedido.nombre }}</span>
                    <span class="detail-count">: {{ estado.total }} pedidos</span>
                  </div>
                  <div class="detail-bar">
                    <div class="bar-fill" :style="{ width: (estado.total / dashboardData.pedidos.total * 100) + '%' }">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>

import { ref, onMounted, computed, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import api from '@/api'

export default {
  name: 'AdminDashboard',
  setup() {
    const dashboardData = ref({})
    const globalLoading = ref(false)
    const globalError = ref(false)
    const hasData = ref(false)

    // Referencias para los charts
    const usuariosPuestoChart = ref(null)
    const pedidosEstadoChart = ref(null)
    const herramientasEstadoChart = ref(null)
    const resumenGeneralChart = ref(null)

    // Referencias para las instancias de Chart.js
    let usuariosPuestoChartInstance = null
    let pedidosEstadoChartInstance = null
    let herramientasEstadoChartInstance = null
    let resumenGeneralChartInstance = null

    // Computed para herramientas disponibles
    const herramientasDisponibles = computed(() => {
      const herramientas = dashboardData.value.herramientas?.porEstado || []
      const disponibles = herramientas.find(h => h.estado_herramienta.nombre === 'Disponible')
      return disponibles ? parseInt(disponibles.total) : 0
    })

    // Función para cargar datos del dashboard
    const loadDashboardData = async () => {
      try {
        globalLoading.value = true
        globalError.value = false

        const data = await api.get('/dashboard/admin')
        dashboardData.value = data
        hasData.value = true

        // Esperar un tick para que el DOM se actualice
        await nextTick()
        createCharts()

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        globalError.value = true
      } finally {
        globalLoading.value = false
      }
    }

    // Función para refrescar todos los datos
    const refreshAllData = () => {
      loadDashboardData()
    }

    // Colores para los gráficos
    const colors = {
      primary: '#3498db',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#17a2b8',
      purple: '#9b59b6',
      pink: '#e91e63',
      orange: '#fd7e14',
      teal: '#20c997',
      indigo: '#6610f2'
    }

    // Función para crear los gráficos
    const createCharts = () => {
      createUsuariosPuestoChart()
      createPedidosEstadoChart()
      createHerramientasEstadoChart()
      createResumenGeneralChart()
    }

    // Gráfico de usuarios por puesto
    const createUsuariosPuestoChart = () => {
      if (usuariosPuestoChartInstance) {
        usuariosPuestoChartInstance.destroy()
      }

      const ctx = usuariosPuestoChart.value.getContext('2d')
      const data = dashboardData.value.usuarios?.porPuesto || []

      usuariosPuestoChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.puesto.nombre_puesto),
          datasets: [{
            label: 'Usuarios',
            data: data.map(item => parseInt(item.total)),
            backgroundColor: [
              colors.primary,
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
              colors.purple
            ],
            borderColor: [
              colors.primary,
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
              colors.purple
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      })
    }

    // Gráfico de pedidos por estado
    const createPedidosEstadoChart = () => {
      if (pedidosEstadoChartInstance) {
        pedidosEstadoChartInstance.destroy()
      }

      const ctx = pedidosEstadoChart.value.getContext('2d')
      const data = dashboardData.value.pedidos?.porEstado || []

      pedidosEstadoChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.estados_pedido.nombre),
          datasets: [{
            data: data.map(item => parseInt(item.total)),
            backgroundColor: [
              colors.warning,
              colors.success,
              colors.info,
              colors.danger,
              colors.purple
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    // Gráfico de herramientas por estado
    const createHerramientasEstadoChart = () => {
      if (herramientasEstadoChartInstance) {
        herramientasEstadoChartInstance.destroy()
      }

      const ctx = herramientasEstadoChart.value.getContext('2d')
      const data = dashboardData.value.herramientas?.porEstado || []

      herramientasEstadoChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(item => item.estado_herramienta.nombre),
          datasets: [{
            data: data.map(item => parseInt(item.total)),
            backgroundColor: [
              colors.success,
              colors.warning,
              colors.info,
              colors.orange,
              colors.danger,
              colors.teal
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    // Gráfico resumen general
    const createResumenGeneralChart = () => {
      if (resumenGeneralChartInstance) {
        resumenGeneralChartInstance.destroy()
      }

      const ctx = resumenGeneralChart.value.getContext('2d')

      resumenGeneralChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Usuarios', 'Pedidos', 'Herramientas'],
          datasets: [{
            data: [
              dashboardData.value.usuarios?.total || 0,
              dashboardData.value.pedidos?.total || 0,
              dashboardData.value.herramientas?.total || 0
            ],
            backgroundColor: [
              colors.primary,
              colors.warning,
              colors.success
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })

    return {
      dashboardData,
      globalLoading,
      globalError,
      hasData,
      herramientasDisponibles,
      usuariosPuestoChart,
      pedidosEstadoChart,
      herramientasEstadoChart,
      resumenGeneralChart,
      refreshAllData
    }
  }
}
</script>

<style src="src/assets/EstiloBase.css" scoped></style>
<style src="src/assets/DashbordAdmin.css" scoped></style>
