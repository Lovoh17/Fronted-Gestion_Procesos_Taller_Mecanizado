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
import Sidebar from '@/components/VistasAdmin/ComponentesAdmin/Sidebar.vue'
import TopBar from '@/components/VistasAdmin/ComponentesAdmin/TopBar.vue'
import StatsCards from '@/components/VistasAdmin/ComponentesAdmin/StatsCards.vue'
import DashboardSalesChart from '@/components/VistasAdmin/ComponentesAdmin/DashboardSalesChart.vue'
import RecentOrders from '@/components/VistasAdmin/ComponentesAdmin//RecentOrders.vue'
import ActivityFeed from '@/components/VistasAdmin/ComponentesAdmin//ActivityFeed.vue'
import OrderDetailsModal from '@/components/VistasAdmin/ComponentesAdmin/OrderDetailsModal.vue'

export default {
  name: 'DashboardView',
  components: {
    Sidebar,
    TopBar,
    StatsCards,
    DashboardSalesChart,
    RecentOrders,
    ActivityFeed,
    OrderDetailsModal
  },
  data() {
    return {
      userData: {
        name: 'John Doe',
        email: 'admin@industrial.com',
        avatar: 'https://randomuser.me/api/portraits/men/56.jpg'
      },
      notifications: [
        {
          id: 1,
          title: 'Nuevo pedido recibido',
          icon: 'shopping_cart',
          time: new Date(),
          read: false
        },
        {
          id: 2,
          title: 'Inventario bajo en discos de corte',
          icon: 'inventory',
          time: new Date(Date.now() - 3600000),
          read: false
        },
        {
          id: 3,
          title: 'Actualización del sistema disponible',
          icon: 'system_update',
          time: new Date(Date.now() - 86400000),
          read: true
        }
      ],
      statsData: [
        { title: 'Ventas Totales', value: '$24,780', change: '+12.5%', isPositive: true, icon: 'attach_money' },
        { title: 'Pedidos', value: '1,245', change: '+8.2%', isPositive: true, icon: 'shopping_cart' },
        { title: 'Clientes', value: '856', change: '-2.3%', isPositive: false, icon: 'people' },
        { title: 'Ingresos', value: '$8,420', change: '+5.7%', isPositive: true, icon: 'paid' }
      ],
      recentOrders: [
        { id: '#INV-7841', client: 'Industrial Solutions', date: '15 Jun 2023', total: '$1,245.00', status: 'completed' },
        { id: '#INV-7839', client: 'MetalWorks Inc.', date: '14 Jun 2023', total: '$845.50', status: 'processing' },
        { id: '#INV-7835', client: 'Steel Fabricators', date: '13 Jun 2023', total: '$2,340.00', status: 'pending' },
        { id: '#INV-7828', client: 'Heavy Machinery Co.', date: '12 Jun 2023', total: '$3,125.75', status: 'completed' },
        { id: '#INV-7821', client: 'Construction Ltd.', date: '10 Jun 2023', total: '$1,780.00', status: 'cancelled' }
      ],
      recentActivities: [
        { user: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', action: 'Ha completado el pedido #INV-7841 por $1,245.00', time: 'Hace 2 horas' },
        { user: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', action: 'Ha agregado un nuevo producto al inventario', time: 'Hace 5 horas' },
        { user: 'Emily Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', action: 'Ha actualizado la información de un cliente', time: 'Ayer a las 3:45 PM' },
        { user: 'David Wilson', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', action: 'Ha cancelado el pedido #INV-7821', time: 'Ayer a las 11:20 AM' }
      ],
      quickStatsData: [
        { value: '24', label: 'Productos Nuevos' },
        { value: '15', label: 'Pedidos Hoy' },
        { value: '8', label: 'Clientes Nuevos' },
        { value: '92%', label: 'Satisfacción' }
      ]
    }
  }
}
</script>
