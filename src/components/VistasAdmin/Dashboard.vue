<template>
  <div class="dashboard-content">
    <!-- Contenido dinámico que se mostrará dentro del layout de App.vue -->
    <StatsCards :stats="statsData" />
    
    <div class="content-grid">
      <div class="content-column">
        <DashboardSalesChart :sales-data="salesData" />
        <RecentOrders 
          :orders="recentOrders" 
          @view-order="viewOrderDetails"
        />
      </div>
      
      <div class="content-column">
        <ActivityFeed :activities="recentActivities" />
        <QuickStats :stats="quickStatsData" />
      </div>
    </div>
    
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
          backgroundColor: '#3B82F6'
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
        
        // Contar pedidos pendientes y completados (asumiendo estructura básica)
        const pedidosPendientes = pedidos.data.filter(p => 
          p.estado && p.estado.toLowerCase().includes('pendiente')
        ).length;
        
        const pedidosCompletados = pedidos.data.filter(p => 
          p.estado && p.estado.toLowerCase().includes('completado')
        ).length;
        
        // Calcular ingresos del mes actual
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
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            borderWidth: 2
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
            status: pedido.estado || 'Pendiente', // Usa el estado directo del pedido
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
        
        // Actividades de pedidos recientes
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
        
        // Actividades de movimientos de stock
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
        
        // Actividades de herramientas en mantenimiento
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
