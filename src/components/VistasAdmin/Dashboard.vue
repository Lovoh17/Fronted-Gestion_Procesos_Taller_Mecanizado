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
import Sidebar from '@/components/GlobalComponents/Sidebar.vue'
import TopBar from '@/components/GlobalComponents/TopBar.vue'
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
  }
}
</script>
