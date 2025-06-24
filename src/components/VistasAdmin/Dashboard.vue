<template>
  <div class="dashboard-content">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Panel de Control</h1>
        <p class="dashboard-subtitle">Resumen de tu negocio en tiempo real</p>
      </div>
      <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
        <svg class="refresh-icon" :class="{ 'rotating': isLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22-4l-4.36 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Cards de Estadísticas Principales -->
    <StatsCards :stats="statsData" :loading="loading.stats" />
    
    <div class="content-grid">
      <div class="content-column">
        <!-- Gráfico de Ventas -->
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <h3 class="card-title">Ingresos Mensuales</h3>
            <div class="card-actions">
              <select class="period-selector">
                <option value="6">Últimos 6 meses</option>
                <option value="12">Último año</option>
              </select>
            </div>
          </div>
          <DashboardSalesChart :sales-data="salesData" :loading="loading.sales" />
        </div>

        <!-- Pedidos Recientes -->
        <div class="dashboard-card orders-card">
          <div class="card-header">
            <h3 class="card-title">Pedidos Recientes</h3>
            <span class="orders-count">{{ recentOrders.length }} pedidos</span>
          </div>
          <RecentOrders 
            :orders="recentOrders" 
            :loading="loading.orders"
            @view-order="viewOrderDetails"
          />
        </div>
      </div>
      
      <div class="content-column">
        <!-- Feed de Actividades -->
        <div class="dashboard-card activity-card">
          <div class="card-header">
            <h3 class="card-title">Actividad Reciente</h3>
            <div class="activity-indicator">
              <div class="pulse-dot"></div>
              En vivo
            </div>
          </div>
          <ActivityFeed :activities="recentActivities" :loading="loading.activities" />
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="dashboard-card stats-card">
          <div class="card-header">
            <h3 class="card-title">Estadísticas Rápidas</h3>
          </div>
          <QuickStats :stats="quickStatsData" :loading="loading.quickStats" />
        </div>
      </div>
    </div>
    
    <!-- Modal de Detalles del Pedido -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
    />
  </div>
</template>

<script>
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
    OrderDetailsModal
  },
  
  data() {
    return {
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

<style scoped>
/* Variables de Color - Colores oscuros y legibles */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-accent: #f1f5f9;
  
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dashboard-content {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
}

/* Header del Dashboard */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.header-content h1.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.25rem 0;
}

.dashboard-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Grid Layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-top: 2rem;
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Cards Base */
.dashboard-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--bg-accent);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.card-actions .period-selector {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  background: var(--bg-accent);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
}

.card-actions .period-selector:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Chart Card */
.chart-card {
  min-height: 400px;
}

/* Orders Card */
.orders-card {
  flex: 1;
}

.orders-count {
  background: var(--success-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Activity Card */
.activity-card {
  min-height: 300px;
}

.activity-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Smooth Transitions */
* {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}
</style>