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
            <va-button color="#003366" @click="refreshData = true" :disabled="isLoading" icon="update">
              Actualizar
            </va-button>
          </div>
        </div>
      </div>

      <!-- Indicadores de Carga Global -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner-border" role="status">
          <span class="sr-only">Cargando...</span>
        </div>
      </div>

      <!-- Grid Principal del Dashboard -->
      <div v-else class="dashboard-grid">
        <!-- Fila de Estadísticas Principales -->
        <section class="stats-section">
          <h2 class="section-title">Estadísticas Generales</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon total-orders">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ statsData.totalPedidos }}</h3>
                <p class="stat-label">Total Pedidos</p>
                <span class="stat-trend positive">+12%</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon pending-orders">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ statsData.pedidosPendientes }}</h3>
                <p class="stat-label">Pedidos Pendientes</p>
                <span class="stat-trend neutral">{{ Math.round((statsData.pedidosPendientes / statsData.totalPedidos) *
                  100) }}%</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon completed-orders">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ statsData.pedidosCompletados }}</h3>
                <p class="stat-label">Pedidos Completados</p>
                <span class="stat-trend positive">+8%</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon revenue">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">${{ formatCurrency(statsData.ingresosMes) }}</h3>
                <p class="stat-label">Ingresos del Mes</p>
                <span class="stat-trend positive">+15%</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon users">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ statsData.totalUsuarios }}</h3>
                <p class="stat-label">Total Usuarios</p>
                <span class="stat-trend positive">+3</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon tools">
                <i class="fas fa-tools"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ statsData.herramientasDisponibles }}</h3>
                <p class="stat-label">Herramientas Disponibles</p>
                <span class="stat-trend neutral">{{ Math.round((statsData.herramientasDisponibles /
                  (statsData.herramientasDisponibles + 5)) * 100) }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Fila de Gráficos y Análisis -->
        <section class="analytics-section">
          <div class="analytics-grid">
            <!-- Gráfico de Ingresos -->
            <div class="card chart-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="fas fa-chart-line mr-2"></i>
                  Análisis de Ingresos
                </h3>
                <div class="card-controls">
                  <select class="form-control form-control-sm" v-model="selectedPeriod" @change="loadSalesChart">
                    <option value="6">Últimos 6 meses</option>
                    <option value="12">Último año</option>
                    <option value="24">Últimos 2 años</option>
                  </select>
                </div>
              </div>
              <div class="card-body">
                <DashboardSalesChart :sales-data="salesData" :loading="loading.sales" />
              </div>
            </div>

            <!-- Actividad Reciente -->
            <div class="card activity-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="fas fa-bell mr-2"></i>
                  Actividad Reciente
                </h3>
                <div class="live-indicator">
                  <span class="pulse-dot"></span>
                  En vivo
                </div>
              </div>
              <div class="card-body">
                <ActivityFeed :activities="recentActivities" :loading="loading.activities" />
              </div>
            </div>
          </div>
        </section>

        <!-- Fila de Pedidos y Estadísticas -->
        <section class="orders-section">
          <div class="orders-grid">
            <!-- Pedidos Recientes -->
            <div class="card orders-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="fas fa-list-alt mr-2"></i>
                  Pedidos Recientes
                </h3>
                <div class="orders-summary">
                  <span class="badge badge-primary">{{ recentOrders.length }} pedidos</span>
                </div>
              </div>
              <div class="card-body">
                <RecentOrders :orders="recentOrders" :loading="loading.orders" @view-order="viewOrderDetails" />
              </div>
            </div>

            <!-- Estadísticas Rápidas -->
            <div class="card quick-stats-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="fas fa-tachometer-alt mr-2"></i>
                  Métricas de Hoy
                </h3>
              </div>
              <div class="card-body">
                <div class="quick-stats-grid">
                  <div class="quick-stat">
                    <div class="quick-stat-icon today-orders">
                      <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="quick-stat-info">
                      <span class="quick-stat-number">{{ quickStatsData.pedidosHoy }}</span>
                      <span class="quick-stat-label">Pedidos Hoy</span>
                    </div>
                  </div>

                  <div class="quick-stat">
                    <div class="quick-stat-icon tools-in-use">
                      <i class="fas fa-hammer"></i>
                    </div>
                    <div class="quick-stat-info">
                      <span class="quick-stat-number">{{ quickStatsData.herramientasEnUso }}</span>
                      <span class="quick-stat-label">Herramientas en Uso</span>
                    </div>
                  </div>

                  <div class="quick-stat">
                    <div class="quick-stat-icon maintenance">
                      <i class="fas fa-wrench"></i>
                    </div>
                    <div class="quick-stat-info">
                      <span class="quick-stat-number">{{ quickStatsData.mantenimientosPendientes }}</span>
                      <span class="quick-stat-label">Mantenimientos Pendientes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Modal de Detalles del Pedido -->
      <OrderDetailsModal v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/GlobalComponents/Sidebar.vue'
import axios from 'axios'
import StatsCards from '@/components/VistasAdmin/ComponentesAdmin/StatsCards.vue'
import DashboardSalesChart from '@/components/VistasAdmin/ComponentesAdmin/DashboardSalesChart.vue'
import RecentOrders from '@/components/VistasAdmin/ComponentesAdmin/RecentOrders.vue'
import ActivityFeed from '@/components/VistasAdmin/ComponentesAdmin/ActivityFeed.vue'
import QuickStats from '@/components/VistasAdmin/ComponentesAdmin/QuickStats.vue'
import OrderDetailsModal from '@/components/VistasAdmin/ComponentesAdmin/OrderDetailsModal.vue'

export default {
  name: 'DashboardView',
  components: {
    StatsCards,
    DashboardSalesChart,
    RecentOrders,
    ActivityFeed,
    QuickStats,
    OrderDetailsModal,
    Sidebar
  },

  data() {
    return {
      selectedPeriod: '6',

      statsData: {
        totalPedidos: 0,
        pedidosPendientes: 0,
        pedidosCompletados: 0,
        ingresosMes: 0,
        totalUsuarios: 0,
        herramientasDisponibles: 0
      },

      salesData: {
        labels: [],
        datasets: [{
          label: 'Ingresos',
          data: [],
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: '#6366f1',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },

      recentOrders: [],
      recentActivities: [],

      quickStatsData: {
        pedidosHoy: 0,
        herramientasEnUso: 0,
        mantenimientosPendientes: 0
      },

      selectedOrder: null,
      loading: {
        stats: false,
        sales: false,
        orders: false,
        activities: false,
        quickStats: false
      }
    }
  },

  computed: {
    isLoading() {
      return Object.values(this.loading).some(loading => loading);
    }
  },

  methods: {
    async loadStats() {
      try {
        this.loading.stats = true;

        const [pedidos, usuarios, herramientas, transacciones] = await Promise.all([
          axios.get('/api/Pedido'),
          axios.get('/api/Usuario'),
          axios.get('/api/Herramienta'),
          axios.get('/api/Transaccion_Financiera')
        ]);

        const totalPedidos = pedidos.data.length;

        const pedidosPendientes = pedidos.data.filter(p =>
          p.estado && p.estado.toLowerCase().includes('pendiente')
        ).length;

        const pedidosCompletados = pedidos.data.filter(p =>
          p.estado && p.estado.toLowerCase().includes('completado')
        ).length;

        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        const ingresosMes = transacciones.data
          .filter(t => {
            const fecha = new Date(t.fecha);
            return fecha.getMonth() === mesActual &&
              fecha.getFullYear() === añoActual &&
              t.tipo === 'ingreso';
          })
          .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

        this.statsData = {
          totalPedidos,
          pedidosPendientes,
          pedidosCompletados,
          ingresosMes,
          totalUsuarios: usuarios.data.length,
          herramientasDisponibles: herramientas.data.filter(h => h.disponible).length
        };

      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        this.showToast('Error al cargar estadísticas', 'error');
      } finally {
        this.loading.stats = false;
      }
    },

    async loadSalesChart() {
      try {
        this.loading.sales = true;

        const response = await axios.get('/api/Transaccion_Financiera');
        const transacciones = response.data;

        const salesByMonth = {};
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
          const fecha = new Date();
          fecha.setMonth(fecha.getMonth() - i);
          const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          const label = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
          salesByMonth[key] = { label, amount: 0 };
        }

        transacciones
          .filter(t => t.tipo === 'ingreso')
          .forEach(t => {
            const fecha = new Date(t.fecha);
            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
            if (salesByMonth[key]) {
              salesByMonth[key].amount += parseFloat(t.monto || 0);
            }
          });

        const salesArray = Object.values(salesByMonth);

        this.salesData = {
          labels: salesArray.map(s => s.label),
          datasets: [{
            label: 'Ingresos ($)',
            data: salesArray.map(s => s.amount),
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#6366f1',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        };

      } catch (error) {
        console.error('Error cargando gráfico de ventas:', error);
        this.showToast('Error al cargar gráfico de ventas', 'error');
      } finally {
        this.loading.sales = false;
      }
    },

    async loadRecentOrders() {
      try {
        this.loading.orders = true;

        const [pedidos, usuarios] = await Promise.all([
          axios.get('/api/Pedido'),
          axios.get('/api/Usuario')
        ]);

        const usuariosMap = usuarios.data.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        this.recentOrders = pedidos.data
          .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
          .slice(0, 10)
          .map(pedido => ({
            id: pedido.id,
            orderNumber: `PED-${String(pedido.id).padStart(4, '0')}`,
            customerName: usuariosMap[pedido.usuario_id]?.nombre || 'Usuario desconocido',
            customerEmail: usuariosMap[pedido.usuario_id]?.email || '',
            serviceType: pedido.descripcion || 'Servicio',
            status: pedido.estado || 'Pendiente',
            totalAmount: parseFloat(pedido.total || 0),
            createdAt: pedido.fecha_pedido,
            estimatedCompletion: pedido.fecha_entrega
          }));

      } catch (error) {
        console.error('Error cargando pedidos recientes:', error);
        this.showToast('Error al cargar pedidos recientes', 'error');
      } finally {
        this.loading.orders = false;
      }
    },

    async loadRecentActivities() {
      try {
        this.loading.activities = true;

        const [pedidos, herramientas, historialStock] = await Promise.all([
          axios.get('/api/Pedido'),
          axios.get('/api/Herramienta'),
          axios.get('/api/Historial_Movimiento_Stock')
        ]);

        const activities = [];

        pedidos.data
          .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
          .slice(0, 5)
          .forEach(pedido => {
            activities.push({
              id: `pedido-${pedido.id}`,
              type: 'pedido_creado',
              title: 'Nuevo pedido creado',
              description: `Pedido #PED-${String(pedido.id).padStart(4, '0')} registrado`,
              timestamp: pedido.fecha_pedido,
              icon: '📋'
            });
          });

        historialStock.data
          .sort((a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento))
          .slice(0, 3)
          .forEach(movimiento => {
            activities.push({
              id: `stock-${movimiento.id}`,
              type: 'movimiento_stock',
              title: 'Movimiento de inventario',
              description: `${movimiento.tipo_movimiento}: ${movimiento.cantidad} unidades`,
              timestamp: movimiento.fecha_movimiento,
              icon: '📦'
            });
          });

        herramientas.data
          .filter(h => h.estado && h.estado.toLowerCase().includes('mantenimiento'))
          .sort((a, b) => new Date(b.fecha_ultimo_mantenimiento) - new Date(a.fecha_ultimo_mantenimiento))
          .slice(0, 2)
          .forEach(herramienta => {
            activities.push({
              id: `herramienta-${herramienta.id}`,
              type: 'herramienta_mantenimiento',
              title: 'Herramienta en mantenimiento',
              description: `${herramienta.nombre} en ${herramienta.estado}`,
              timestamp: herramienta.fecha_ultimo_mantenimiento,
              icon: '🛠️'
            });
          });

        this.recentActivities = activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

      } catch (error) {
        console.error('Error cargando actividades:', error);
        this.showToast('Error al cargar actividades', 'error');
      } finally {
        this.loading.activities = false;
      }
    },

    async loadQuickStats() {
      try {
        this.loading.quickStats = true;

        const [pedidos, herramientas, mantenimientos] = await Promise.all([
          axios.get('/api/Pedido'),
          axios.get('/api/Herramienta'),
          axios.get('/api/Mantenimiento')
        ]);

        const hoy = new Date().toISOString().split('T')[0];

        this.quickStatsData = {
          pedidosHoy: pedidos.data.filter(p =>
            p.fecha_pedido?.startsWith(hoy)
          ).length,

          herramientasEnUso: herramientas.data.filter(h =>
            !h.disponible
          ).length,

          mantenimientosPendientes: mantenimientos.data.filter(m =>
            m.estado === 'pendiente' || m.estado === 'programado'
          ).length
        };

      } catch (error) {
        console.error('Error cargando estadísticas rápidas:', error);
        this.showToast('Error al cargar estadísticas rápidas', 'error');
      } finally {
        this.loading.quickStats = false;
      }
    },

    async viewOrderDetails(order) {
      try {
        const response = await axios.get(`/api/Pedido/${order.id}`);
        this.selectedOrder = response.data;
      } catch (error) {
        console.error('Error cargando detalles del pedido:', error);
        this.showToast('Error al cargar detalles del pedido', 'error');
      }
    },

    async loadDashboardData() {
      await Promise.all([
        this.loadStats(),
        this.loadSalesChart(),
        this.loadRecentOrders(),
        this.loadRecentActivities(),
        this.loadQuickStats()
      ]);
    },

    async refreshData() {
      await this.loadDashboardData();
      this.showToast('Datos actualizados correctamente', 'success');
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    },

    showToast(message, type = 'success') {
      const alertType = type === 'success' ? 'Éxito' : 'Error';
      alert(`${alertType}: ${message}`);
    }
  },

  async mounted() {
    await this.loadDashboardData();
  }
}
</script>
<style src="src/assets/EstiloBase.css"></style>
<style scoped>
.refresh-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}


@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Stats Card */
.stats-card {
  min-height: 200px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .content-column {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-content h1.dashboard-title {
    font-size: 1.5rem;
  }

  .content-grid {
    gap: 1rem;
  }

  .dashboard-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}

/* Loading States */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Smooth Transitions */
* {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* Nuevos estilos para el dashboard rediseñado */


.dashboard-main {
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Titles */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  padding-left: 0.5rem;
  border-left: 4px solid #003366;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #003366, #0066cc);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-icon.total-orders {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.pending-orders {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.completed-orders {
  background: linear-gradient(135deg, #10b981, #047857);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.users {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.stat-icon.tools {
  background: linear-gradient(135deg, #84cc16, #65a30d);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-trend.positive {
  background: #dcfdf7;
  color: #059669;
}

.stat-trend.negative {
  background: #fef2f2;
  color: #dc2626;
}

.stat-trend.neutral {
  background: #f1f5f9;
  color: #475569;
}

/* Analytics Section */
.analytics-section {
  margin-bottom: 2rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Orders Section */
.orders-section {
  margin-bottom: 2rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body {
  padding: 2rem;
}

.card-controls select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
}

/* Live Indicator */
.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-primary {
  background: #dbeafe;
  color: #1d4ed8;
}

/* Quick Stats Grid */
.quick-stats-grid {
  display: grid;
  gap: 1.5rem;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.quick-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.quick-stat-icon.today-orders {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.quick-stat-icon.tools-in-use {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.quick-stat-icon.maintenance {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.quick-stat-info {
  flex: 1;
}

.quick-stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.quick-stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}



.header-actions .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.header-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1200px) {

  .analytics-grid,
  .orders-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 1.875rem;
  }

  .card-body {
    padding: 1.5rem;
  }
}

/* Utilidades */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
