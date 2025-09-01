<template>
  <div class="">
    <main class="">
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="header-text">
              <h1 class="header-title">Panel del Coordinador</h1>
              <p class="header-subtitle">Gestiona usuarios, asignaciones y el flujo de trabajo del equipo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos del dashboard...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar datos</h3>
            <p>{{ error }}</p>
            <button @click="fetchDashboardData" class="retry-btn">
              <i class="fas fa-redo"></i> Reintentar
            </button>
          </div>
        </div>

        <!-- Dashboard Data -->
        <div v-else class="dashboard-grid">
          <!-- Pedidos Section -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-shopping-cart"></i>
              Estado de Pedidos
            </h2>
            <div class="stats-grid">
              <div class="stat-card pending">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.pedidos?.pendientes || 0 }}</h3>
                  <p>Pedidos Pendientes</p>
                </div>
              </div>
              <div class="stat-card processing">
                <div class="stat-icon">
                  <i class="fas fa-cog"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.pedidos?.enProceso || 0 }}</h3>
                  <p>Pedidos en Proceso</p>
                </div>
              </div>
              <div class="stat-card completed">
                <div class="stat-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.pedidos?.completados || 0 }}</h3>
                  <p>Pedidos Completados</p>
                </div>
              </div>
              <div class="stat-card cancelled">
                <div class="stat-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.pedidos?.cancelados || 0 }}</h3>
                  <p>Pedidos Cancelados</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Herramientas Section -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-tools"></i>
              Estado de Herramientas
            </h2>
            <div class="stats-grid">
              <div class="stat-card tools">
                <div class="stat-icon">
                  <i class="fas fa-wrench"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.herramientas?.enUso || 0 }}</h3>
                  <p>Herramientas en Uso</p>
                </div>
              </div>
              <div class="stat-card tools-available">
                <div class="stat-icon">
                  <i class="fas fa-toolbox"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.herramientas?.disponibles || 0 }}</h3>
                  <p>Herramientas Disponibles</p>
                </div>
              </div>
              <div class="stat-card tools-maintenance">
                <div class="stat-icon">
                  <i class="fas fa-hammer"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ dashboardData.herramientas?.mantenimiento || 0 }}</h3>
                  <p>En Mantenimiento</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empleados Section -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-users"></i>
              Estado del Personal
            </h2>
            <div class="stats-grid">
              <div class="stat-card employees-active">
                <div class="stat-icon">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ getConteoUsuariosActivos() }}</h3>
                  <p>Usuarios Únicos</p>
                </div>
              </div>
              <div class="stat-card employees-busy">
                <div class="stat-icon">
                  <i class="fas fa-user-clock"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ getTransaccionesPendientes() }}</h3>
                  <p>Transacciones Pendientes</p>
                </div>
              </div>
              <div class="stat-card employees-free">
                <div class="stat-icon">
                  <i class="fas fa-user-plus"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ getTransaccionesAprobadas() }}</h3>
                  <p>Transacciones Aprobadas</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Finanzas Section -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-chart-line"></i>
              Resumen Financiero
            </h2>
            <div class="stats-grid">
              <div class="stat-card revenue">
                <div class="stat-icon">
                  <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ formatCurrency(getIngresosRecientes()) }}</h3>
                  <p>Ingresos Recientes</p>
                </div>
              </div>
              <div class="stat-card expenses">
                <div class="stat-icon">
                  <i class="fas fa-receipt"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ formatCurrency(getGastosRecientes()) }}</h3>
                  <p>Gastos Recientes</p>
                </div>
              </div>
              <div class="stat-card profit">
                <div class="stat-icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ formatCurrency(getIngresosRecientes() - getGastosRecientes()) }}</h3>
                  <p>Balance Neto</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Productividad Chart -->
          <div class="dashboard-section full-width">
            <h2 class="section-title">
              <i class="fas fa-chart-area"></i>
              Transacciones por Departamento
            </h2>
            <div class="chart-container">
              <div class="week-chart">
                <div 
                  v-for="(departamento, index) in getDepartamentosData()" 
                  :key="index"
                  class="day-bar"
                >
                  <div class="bar-container">
                    <div 
                      class="bar productivity-bar"
                      :style="{ height: getDepartmentHeight(departamento.count) + '%' }"
                    ></div>
                  </div>
                  <div class="day-info">
                    <span class="day-label">Dept {{ departamento.id }}</span>
                    <span class="day-value">{{ departamento.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Transacciones Recientes Section -->
          <div class="dashboard-section full-width" v-if="dashboardData.transacciones?.recientes?.length">
            <h2 class="section-title">
              <i class="fas fa-money-bill-wave"></i>
              Transacciones Recientes
            </h2>
            <div class="table-container">
              <table class="transactions-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaccion in dashboardData.transacciones.recientes.slice(0, 10)" :key="transaccion.id">
                    <td>{{ formatDate(transaccion.fecha_transaccion) }}</td>
                    <td class="amount">{{ formatCurrency(transaccion.monto_total) }}</td>
                    <td>{{ transaccion.tipo_transaccion || 'N/A' }}</td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(transaccion.estado)">
                        {{ transaccion.estado || 'Pendiente' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Gastos por Mes Section -->
          <div class="dashboard-section full-width" v-if="dashboardData.transacciones?.gastosPorMes?.length">
            <h2 class="section-title">
              <i class="fas fa-chart-bar"></i>
              Gastos por Mes
            </h2>
            <div class="chart-container">
              <div class="month-chart">
                <div 
                  v-for="gasto in dashboardData.transacciones.gastosPorMes" 
                  :key="gasto.mes"
                  class="month-bar"
                >
                  <div class="bar-container">
                    <div 
                      class="bar expense-bar"
                      :style="{ height: getBarHeight(gasto.total_mes) + '%' }"
                    ></div>
                  </div>
                  <div class="month-info">
                    <span class="month-label">{{ formatMonth(gasto.mes) }}</span>
                    <span class="month-amount">{{ formatCurrency(gasto.total_mes) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Distribución de Transacciones Chart -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-project-diagram"></i>
              Tipos de Transacciones
            </h2>
            <div class="donut-chart-container">
              <div class="simple-stats">
                <div 
                  v-for="(tipo, index) in getTiposTransacciones()" 
                  :key="index"
                  class="tipo-item"
                >
                  <div class="tipo-color" :style="{ backgroundColor: getProjectColor(index) }"></div>
                  <div class="tipo-info">
                    <span class="tipo-name">Tipo {{ tipo.tipo }}</span>
                    <span class="tipo-count">{{ tipo.count }} transacciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen de Transacciones -->
          <div class="dashboard-section">
            <h2 class="section-title">
              <i class="fas fa-trophy"></i>
              Resumen de Estados
            </h2>
            <div class="performance-container">
              <div 
                v-for="estado in getEstadosTransacciones()" 
                :key="estado.id"
                class="performance-item"
              >
                <div class="member-info">
                  <div class="member-avatar" :class="'estado-' + estado.id">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div class="member-details">
                    <h4>Estado {{ estado.id }}</h4>
                    <p>{{ estado.count }} transacciones</p>
                  </div>
                </div>
                <div class="performance-metrics">
                  <div class="metric">
                    <span class="metric-label">Porcentaje</span>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill efficiency"
                        :style="{ width: estado.percentage + '%' }"
                      ></div>
                    </div>
                    <span class="metric-value">{{ estado.percentage.toFixed(1) }}%</span>
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
import api from '../../api.js';

export default {
  name: 'CoordinadorDashboard',
  data() {
    return {
      dashboardData: {},
      loading: true,
      error: null,
      diasSemana: [
        { key: 'lunes', label: 'Lun' },
        { key: 'martes', label: 'Mar' },
        { key: 'miercoles', label: 'Mié' },
        { key: 'jueves', label: 'Jue' },
        { key: 'viernes', label: 'Vie' },
        { key: 'sabado', label: 'Sáb' },
        { key: 'domingo', label: 'Dom' }
      ],
      projectColors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
    };
  },
  async mounted() {
    await this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await api.get('/dashboard/coordinador');
        this.dashboardData = data;
      } catch (error) {
        this.error = error.message || 'Error al cargar los datos del dashboard';
        console.error('Error fetching dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatCurrency(amount) {
      if (amount == null) return '$0.00';
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
    
    formatMonth(monthString) {
      if (!monthString) return 'N/A';
      const date = new Date(monthString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
      });
    },
    
    getStatusClass(status) {
      if (!status) return 'pending';
      switch (status.toLowerCase()) {
        case 'completado':
        case 'aprobado':
          return 'completed';
        case 'pendiente':
          return 'pending';
        case 'rechazado':
        case 'cancelado':
          return 'rejected';
        default:
          return 'pending';
      }
    },
    
    getBarHeight(amount) {
      if (!this.dashboardData.transacciones?.gastosPorMes?.length) return 0;
      
      const maxAmount = Math.max(
        ...this.dashboardData.transacciones.gastosPorMes.map(g => parseFloat(g.total_mes) || 0)
      );
      
      if (maxAmount === 0) return 0;
      return (parseFloat(amount) / maxAmount) * 100;
    },

    getProductivityHeight(percentage) {
      return percentage;
    },

    getProjectColor(index) {
      return this.projectColors[index % this.projectColors.length];
    },

    getSegmentOffset(index) {
      if (!this.dashboardData.proyectos?.distribucion) return 0;
      return this.dashboardData.proyectos.distribucion
        .slice(0, index)
        .reduce((acc, proyecto) => acc + proyecto.porcentaje, 0);
    },

    // Métodos para calcular datos basados en transacciones
    getIngresosRecientes() {
      if (!this.dashboardData.transacciones?.recientes) return 0;
      
      // Tipos de transacción que representan ingresos (ajustar según tu lógica de negocio)
      const tiposIngreso = ['2', '7', '15']; // Por ejemplo: servicios, ventas, otros ingresos
      
      return this.dashboardData.transacciones.recientes
        .filter(t => tiposIngreso.includes(t.tipo_transaccion_id))
        .reduce((sum, t) => sum + parseFloat(t.monto_total || 0), 0);
    },

    getGastosRecientes() {
      if (!this.dashboardData.transacciones?.recientes) return 0;
      
      // Tipos de transacción que representan gastos
      const tiposGasto = ['1', '3', '6', '8', '9', '11', '13', '14']; // Compras, mantenimiento, capacitación, etc.
      
      return this.dashboardData.transacciones.recientes
        .filter(t => tiposGasto.includes(t.tipo_transaccion_id))
        .reduce((sum, t) => sum + parseFloat(t.monto_total || 0), 0);
    },

    getConteoUsuariosActivos() {
      if (!this.dashboardData.transacciones?.recientes) return 0;
      
      const usuariosUnicos = new Set(
        this.dashboardData.transacciones.recientes
          .map(t => t.creado_por)
          .filter(id => id)
      );
      
      return usuariosUnicos.size;
    },

    getTransaccionesPendientes() {
      if (!this.dashboardData.transacciones?.recientes) return 0;
      
      return this.dashboardData.transacciones.recientes
        .filter(t => t.estado_transaccion_id === '1' || t.estado_transaccion_id === '6')
        .length;
    },

    getTransaccionesAprobadas() {
      if (!this.dashboardData.transacciones?.recientes) return 0;
      
      return this.dashboardData.transacciones.recientes
        .filter(t => t.estado_transaccion_id === '2')
        .length;
    },

    getDepartamentosData() {
      if (!this.dashboardData.transacciones?.recientes) return [];
      
      const departamentos = {};
      
      this.dashboardData.transacciones.recientes.forEach(t => {
        const deptId = t.departamento_id;
        if (deptId) {
          departamentos[deptId] = (departamentos[deptId] || 0) + 1;
        }
      });

      return Object.entries(departamentos).map(([id, count]) => ({
        id,
        count
      }));
    },

    getDepartmentHeight(count) {
      const departamentos = this.getDepartamentosData();
      if (departamentos.length === 0) return 0;
      
      const maxCount = Math.max(...departamentos.map(d => d.count));
      return maxCount > 0 ? (count / maxCount) * 100 : 0;
    },

    getTiposTransacciones() {
      if (!this.dashboardData.transacciones?.recientes) return [];
      
      const tipos = {};
      
      this.dashboardData.transacciones.recientes.forEach(t => {
        const tipoId = t.tipo_transaccion_id;
        if (tipoId) {
          tipos[tipoId] = (tipos[tipoId] || 0) + 1;
        }
      });

      return Object.entries(tipos)
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8 tipos
    },

    getEstadosTransacciones() {
      if (!this.dashboardData.transacciones?.recientes) return [];
      
      const estados = {};
      const total = this.dashboardData.transacciones.recientes.length;
      
      this.dashboardData.transacciones.recientes.forEach(t => {
        const estadoId = t.estado_transaccion_id || 'sin_estado';
        estados[estadoId] = (estados[estadoId] || 0) + 1;
      });

      return Object.entries(estados).map(([id, count]) => ({
        id,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
    }
  }
};
</script>

<style src="./styles/Dashboard.css" ></style>
<style src="../../assets/EstiloBase.css" ></style>

<style >
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-message {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
}

.error-message i {
  font-size: 48px;
  color: #e74c3c;
  margin-bottom: 15px;
}

.retry-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: #2980b9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  padding: 20px;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
}

.dashboard-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #3498db;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
}

.stat-card.pending {
  border-left-color: #f39c12;
  background: linear-gradient(135deg, #fff8e1 0%, #f8f9fa 100%);
}

.stat-card.processing {
  border-left-color: #3498db;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
}

.stat-card.completed {
  border-left-color: #27ae60;
  background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
}

.stat-card.cancelled {
  border-left-color: #e74c3c;
  background: linear-gradient(135deg, #fdeaea 0%, #f8f9fa 100%);
}

.stat-card.tools {
  border-left-color: #27ae60;
  background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
}

.stat-card.tools-available {
  border-left-color: #2ecc71;
  background: linear-gradient(135deg, #d5f4e6 0%, #f8f9fa 100%);
}

.stat-card.tools-maintenance {
  border-left-color: #f39c12;
  background: linear-gradient(135deg, #fff8e1 0%, #f8f9fa 100%);
}

.stat-card.employees-active {
  border-left-color: #27ae60;
  background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
}

.stat-card.employees-busy {
  border-left-color: #f39c12;
  background: linear-gradient(135deg, #fff8e1 0%, #f8f9fa 100%);
}

.stat-card.employees-free {
  border-left-color: #3498db;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
}

.stat-card.revenue {
  border-left-color: #27ae60;
  background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
}

.stat-card.expenses {
  border-left-color: #e74c3c;
  background: linear-gradient(135deg, #fdeaea 0%, #f8f9fa 100%);
}

.stat-card.profit {
  border-left-color: #3498db;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(52, 152, 219, 0.1);
}

.stat-icon i {
  font-size: 24px;
  color: #3498db;
}

.pending .stat-icon,
.tools-maintenance .stat-icon,
.employees-busy .stat-icon {
  background: rgba(243, 156, 18, 0.1);
}

.pending .stat-icon i,
.tools-maintenance .stat-icon i,
.employees-busy .stat-icon i {
  color: #f39c12;
}

.completed .stat-icon,
.tools .stat-icon,
.tools-available .stat-icon,
.employees-active .stat-icon,
.revenue .stat-icon {
  background: rgba(39, 174, 96, 0.1);
}

.completed .stat-icon i,
.tools .stat-icon i,
.tools-available .stat-icon i,
.employees-active .stat-icon i,
.revenue .stat-icon i {
  color: #27ae60;
}

.cancelled .stat-icon,
.expenses .stat-icon {
  background: rgba(231, 76, 60, 0.1);
}

.cancelled .stat-icon i,
.expenses .stat-icon i {
  color: #e74c3c;
}

.stat-info h3 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.stat-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transactions-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.transactions-table .amount {
  font-weight: 600;
  color: #27ae60;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.chart-container {
  margin-top: 20px;
}

.month-chart, .week-chart {
  display: flex;
  align-items: end;
  gap: 15px;
  height: 200px;
  padding: 20px 0;
}

.month-bar, .day-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar-container {
  height: 120px;
  display: flex;
  align-items: end;
  width: 100%;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 5px;
  transition: all 0.3s ease;
}

.expense-bar {
  background: linear-gradient(to top, #3498db, #5dade2);
}

.productivity-bar {
  background: linear-gradient(to top, #2ecc71, #58d68d);
}

.month-info, .day-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;
}

.month-label, .day-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

.month-amount, .day-value {
  font-size: 11px;
  color: #2c3e50;
  font-weight: 600;
}

.donut-chart-container {
  display: flex;
  align-items: center;
  gap: 30px;
}

.donut-chart {
  width: 150px;
  height: 150px;
  position: relative;
  border-radius: 50%;
  background: conic-gradient(
    #3498db 0deg,
    #e74c3c 90deg,
    #2ecc71 180deg,
    #f39c12 270deg
  );
}

.donut-chart::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: white;
  border-radius: 50%;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.performance-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.performance-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.member-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 14px;
}

.member-details p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-label {
  font-size: 12px;
  color: #7f8c8d;
  min-width: 70px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.efficiency {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.metric-value {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 35px;
  text-align: right;
}

.simple-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.tipo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tipo-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.tipo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tipo-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.tipo-count {
  font-size: 12px;
  color: #7f8c8d;
}

.member-avatar.estado-1 {
  background: #f39c12;
}

.member-avatar.estado-2 {
  background: #27ae60;
}

.member-avatar.estado-4 {
  background: #3498db;
}

.member-avatar.estado-6 {
  background: #e74c3c;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .month-chart, .week-chart {
    gap: 10px;
  }
  
  .section-title {
    font-size: 16px;
  }

  .donut-chart-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .donut-chart {
    width: 120px;
    height: 120px;
  }

  .simple-stats {
    width: 100%;
  }
}

/* Add these updated styles to fix the financial summary card overflow */

/* Update the stat-info h3 for better responsive font sizing */
.stat-info h3 {
  font-size: clamp(18px, 4vw, 24px); /* Responsive font size with min 18px, max 24px */
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 5px 0;
  line-height: 1.2;
  word-break: break-word; /* Allow text to break if needed */
  overflow-wrap: break-word;
}

/* Specific styling for financial cards to handle larger numbers */
.stat-card.revenue .stat-info h3,
.stat-card.expenses .stat-info h3,
.stat-card.profit .stat-info h3 {
  font-size: clamp(16px, 3.5vw, 22px); /* Smaller font for financial values */
  font-weight: 600;
}

/* Ensure the stat-info paragraph text is also responsive */
.stat-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: clamp(12px, 2.5vw, 14px);
  line-height: 1.3;
}

/* Adjust stat-card padding to accommodate text better */
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px; /* Reduced from 15px */
  padding: 16px; /* Reduced from 20px */
  border-radius: 10px;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  min-height: 80px; /* Ensure minimum height */
}

/* Make stat-icon slightly smaller to give more room to text */
.stat-icon {
  width: 45px; /* Reduced from 50px */
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(52, 152, 219, 0.1);
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.stat-icon i {
  font-size: 20px; /* Reduced from 24px */
  color: #3498db;
}

/* Ensure stat-info takes available space */
.stat-info {
  flex: 1;
  min-width: 0; /* Allow shrinking */
  overflow: hidden;
}

/* Additional mobile responsiveness */
@media (max-width: 768px) {
  .stat-card {
    padding: 14px;
    gap: 10px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-icon i {
    font-size: 18px;
  }
  
  .stat-info h3 {
    font-size: clamp(14px, 4vw, 18px);
  }
  
  .stat-info p {
    font-size: clamp(11px, 3vw, 13px);
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .stat-card {
    padding: 12px;
    gap: 8px;
  }
  
  .stat-info h3 {
    font-size: clamp(13px, 3.5vw, 16px);
  }
  
  .stat-info p {
    font-size: clamp(10px, 2.5vw, 12px);
  }
}

/* Ensure stats-grid has appropriate minimum width for cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Increased from 200px */
  gap: 15px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>