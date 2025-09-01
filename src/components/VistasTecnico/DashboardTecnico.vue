<template>
  <div class="operario-trabajos-container">
    <!-- Header Mejorado -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <i class="header-icon material-icons">engineering</i>
          <div>
            <h1 class="header-title">UNIVO<strong>Técnico</strong></h1>
            <p class="header-subtitle">PANEL TÉCNICO AVANZADO</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="time-display">
            <div class="current-date">{{ currentDate }}</div>
            <div class="current-time">{{ currentTime }}</div>
          </div>
          <va-button @click="refreshData" class="refresh-btn" :class="{ 'refreshing': isRefreshing }">
            <i class="material-icons">refresh</i>
          </va-button>
          <div class="notification-bell" @click="toggleNotifications">
            <i class="material-icons">notifications</i>
            <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estados de Carga/Error -->
    <div v-if="loading" class="loading-state">
      <i class="material-icons">hourglass_empty</i>
      <h3>Cargando Dashboard</h3>
      <p>Obteniendo información técnica...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="material-icons">error</i>
      <h3>Error de Conexión</h3>
      <p>{{ error }}</p>
      <va-button @click="fetchDashboardData">Reintentar</va-button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Section -->
      <div class="stats-container">
        <div class="stat-card stat-pending">
          <div class="stat-card-content">
            <i class="stat-icon material-icons">assignment_late</i>
            <div class="stat-info">
              <h3>{{ dashboardData?.pedidos?.conProblema || 0 }}</h3>
              <p>Pedidos con Problema</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card stat-progress">
          <div class="stat-card-content">
            <i class="stat-icon material-icons">build</i>
            <div class="stat-info">
              <h3>{{ dashboardData?.herramientas?.enReparacion || 0 }}</h3>
              <p>Herramientas en Reparación</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card stat-completed">
          <div class="stat-card-content">
            <i class="stat-icon material-icons">check_circle</i>
            <div class="stat-info">
              <h3>{{ dashboardData?.herramientas?.disponibles || 0 }}</h3>
              <p>Herramientas Disponibles</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card stat-tools">
          <div class="stat-card-content">
            <i class="stat-icon material-icons">precision_manufacturing</i>
            <div class="stat-info">
              <h3>{{ totalHerramientas }}</h3>
              <p>Total Herramientas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pedidos Section -->
      <div class="works-section" v-if="dashboardData?.pedidos?.pedidos?.length > 0">
        <div class="section-header">
          <h2><i class="material-icons">assignment</i> Pedidos del Sistema</h2>
          <span class="tools-count">{{ dashboardData.pedidos.pedidos.length }} pedido(s)</span>
        </div>
        
        <div class="works-grid">
          <div v-for="pedido in dashboardData.pedidos.pedidos" :key="pedido.id" class="work-card">
            <div class="work-header">
              <div class="work-meta">
                <span class="work-id">{{ pedido.codigo_pedido }}</span>
                <span class="work-status" :class="getStatusClass(pedido.estado_id)">
                  {{ getStatusLabel(pedido.estado_id) }}
                </span>
              </div>
              <div class="work-priority" :class="getPriorityClass(pedido.prioridad)">
                <i class="material-icons">priority_high</i>
                Prioridad {{ pedido.prioridad }}
              </div>
            </div>
            
            <h3 class="work-title">{{ pedido.proyecto_asociado || 'Proyecto Sin Nombre' }}</h3>
            <p class="work-description">{{ pedido.notas || 'Sin descripción disponible' }}</p>
            
            <div class="work-details">
              <div class="detail-item">
                <i class="material-icons">schedule</i>
                <span>Solicitado: {{ formatDate(pedido.fecha_solicitud) }}</span>
              </div>
              <div class="detail-item" v-if="pedido.fecha_requerida">
                <i class="material-icons">event</i>
                <span>Requerido: {{ formatDate(pedido.fecha_requerida) }}</span>
              </div>
              <div class="detail-item" v-if="pedido.costo_estimado">
                <i class="material-icons">attach_money</i>
                <span>Estimado: Q{{ parseFloat(pedido.costo_estimado).toFixed(2) }}</span>
              </div>
              <div class="detail-item" v-if="pedido.pausado_desde">
                <i class="material-icons">pause_circle</i>
                <span>Pausado desde: {{ formatDate(pedido.pausado_desde) }}</span>
              </div>
            </div>
            
            <div class="work-actions">
              <va-button size="small" @click="viewPedidoDetails(pedido)">
                Ver Detalles
              </va-button>
              <va-button v-if="pedido.estado_id === 4" size="small" color="warning" @click="resumePedido(pedido)">
                Reanudar
              </va-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Herramientas en Reparación Section -->
      <div class="tools-section" v-if="dashboardData?.herramientas?.herramientaReparando?.length > 0">
        <div class="section-header">
          <h2><i class="material-icons">build_circle</i> Herramientas en Reparación</h2>
          <span class="tools-count">{{ dashboardData.herramientas.herramientaReparando.length }} en reparación</span>
        </div>
        
        <div class="tools-grid">
          <div v-for="herramienta in dashboardData.herramientas.herramientaReparando" :key="herramienta.id" class="tool-card repair-card">
            <i class="tool-icon material-icons">build_circle</i>
            <div class="tool-info">
              <h4>{{ herramienta.nombre }}</h4>
              <p><strong>Modelo:</strong> {{ herramienta.modelo }} - {{ herramienta.fabricante }}</p>
              <p><strong>Serie:</strong> {{ herramienta.numero_serie }}</p>
              <p><strong>Código:</strong> {{ herramienta.codigo_inventario }}</p>
              <p><strong>Uso:</strong> {{ herramienta.horas_uso_actual }}/{{ herramienta.vida_util_horas }} hrs</p>
              <p><strong>Último Mant.:</strong> {{ formatDate(herramienta.fecha_ultimo_mantenimiento) }}</p>
              <div class="tool-status repair">En Reparación</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Herramientas Disponibles Section -->
      <div class="tools-section" v-if="dashboardData?.herramientas?.herramientasDisponibles?.length > 0">
        <div class="section-header">
          <h2><i class="material-icons">check_circle</i> Herramientas Disponibles</h2>
          <select class="filter-select" v-model="selectedToolFilter" @change="applyToolFilter">
            <option value="all">Todas las herramientas</option>
            <option value="soldadoras">Soldadoras</option>
            <option value="cortadoras">Cortadoras</option>
            <option value="taladros">Taladros</option>
            <option value="esmeriles">Esmeriles</option>
          </select>
        </div>
        
        <div class="tools-grid">
          <div v-for="herramienta in filteredAvailableTools" :key="herramienta.id" class="tool-card available-card">
            <i class="tool-icon material-icons">{{ getToolIcon(herramienta.nombre) }}</i>
            <div class="tool-info">
              <h4>{{ herramienta.nombre }}</h4>
              <p><strong>Modelo:</strong> {{ herramienta.modelo }} - {{ herramienta.fabricante }}</p>
              <p><strong>Código:</strong> {{ herramienta.codigo_inventario }}</p>
              <p><strong>Uso:</strong> {{ herramienta.horas_uso_actual }}/{{ herramienta.vida_util_horas }} hrs</p>
              <div class="usage-bar">
                <div class="usage-fill" :style="{ width: getUsagePercentage(herramienta) + '%' }"></div>
              </div>
              <p><strong>Valor:</strong> Q{{ parseFloat(herramienta.valor_actual).toFixed(2) }}</p>
              <div class="tool-status available">Disponible</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Raw Data Debug (temporal) -->
      <div class="works-section" v-if="showRawData">
        <div class="section-header">
          <h2>Datos API (Debug)</h2>
          <va-button @click="showRawData = !showRawData" size="small">
            {{ showRawData ? 'Ocultar' : 'Mostrar' }} Debug
          </va-button>
        </div>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; text-align: left;">{{ JSON.stringify(dashboardData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style ></style>
<style src="./src/assets/EstiloBase.css" ></style>
<style src="src/assets/StyleTecnico/DashboardTecnicoStyle.css" ></style>
<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'

export default {
  name: 'DashboardTecnico',
  setup() {
    // Estados reactivos
    const dashboardData = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const isRefreshing = ref(false)
    const unreadNotifications = ref(0)
    const currentDate = ref('')
    const currentTime = ref('')
    const selectedToolFilter = ref('all')
    const showRawData = ref(false)
    
    // Intervalo para actualizar la hora
    let timeInterval = null
    
    // Computed properties
    const totalHerramientas = computed(() => {
      if (!dashboardData.value?.herramientas) return 0
      return (dashboardData.value.herramientas.disponibles || 0) + 
             (dashboardData.value.herramientas.enReparacion || 0)
    })
    
    const filteredAvailableTools = computed(() => {
      if (!dashboardData.value?.herramientas?.herramientasDisponibles) return []
      
      if (selectedToolFilter.value === 'all') {
        return dashboardData.value.herramientas.herramientasDisponibles
      }
      
      return dashboardData.value.herramientas.herramientasDisponibles.filter(tool => {
        const name = tool.nombre.toLowerCase()
        switch (selectedToolFilter.value) {
          case 'soldadoras':
            return name.includes('soldadora')
          case 'cortadoras':
            return name.includes('cortadora') || name.includes('corte') || name.includes('plasma') || name.includes('cizalla')
          case 'taladros':
            return name.includes('taladro')
          case 'esmeriles':
            return name.includes('esmeril')
          default:
            return true
        }
      })
    })
    
    // Función para consumir la API
    const fetchDashboardData = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log('Fetching data from API...')
        
        const response = await fetch('https://gestionprocesostallermecanizado-production-d0de.up.railway.app/dashboard/tecnico', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Raw API response:', data)
        
        if (!data) {
          throw new Error('No data received from API')
        }
        
        dashboardData.value = data
        
        // Detectar problemas y actualizar notificaciones
        const problemasDetectados = []
        
        if (data.pedidos?.conProblema > 0) {
          problemasDetectados.push(`${data.pedidos.conProblema} pedido(s) con problema`)
        }
        
        if (data.herramientas?.enReparacion > 0) {
          problemasDetectados.push(`${data.herramientas.enReparacion} herramienta(s) en reparación`)
        }
        
        unreadNotifications.value = problemasDetectados.length
        
        console.log('Dashboard data successfully loaded:', data)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        error.value = `Error: ${err.message}. Verifica que la API esté corriendo en http://localhost:3000`
      } finally {
        loading.value = false
        isRefreshing.value = false
      }
    }
    
    // Funciones auxiliares
    const getStatusLabel = (estadoId) => {
      const estados = {
        1: 'pendiente',
        2: 'aprobado',
        3: 'en_proceso',
        4: 'pausado',
        5: 'completado'
      }
      return estados[estadoId] || 'desconocido'
    }
    
    const getStatusClass = (estadoId) => {
      const clases = {
        1: 'pendiente',
        2: 'pendiente',
        3: 'en_proceso',
        4: 'pausado',
        5: 'completado'
      }
      return clases[estadoId] || 'pendiente'
    }
    
    const getPriorityClass = (prioridad) => {
      if (prioridad >= 3) return 'alta'
      if (prioridad === 2) return 'media'
      return 'baja'
    }
    
    const getToolIcon = (nombre) => {
      const name = nombre.toLowerCase()
      if (name.includes('soldadora') || name.includes('robot')) return 'precision_manufacturing'
      if (name.includes('taladro')) return 'handyman'
      if (name.includes('esmeril')) return 'settings'
      if (name.includes('cortadora') || name.includes('plasma') || name.includes('cizalla')) return 'content_cut'
      if (name.includes('prensa')) return 'compress'
      if (name.includes('soplete')) return 'local_fire_department'
      return 'build'
    }
    
    const getUsagePercentage = (herramienta) => {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0
      return Math.min((herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100, 100)
    }
    
    // Función para refrescar datos
    const refreshData = async () => {
      isRefreshing.value = true
      await fetchDashboardData()
    }
    
    // Función para manejar notificaciones
    const toggleNotifications = () => {
      console.log('Toggle notifications')
      unreadNotifications.value = 0
    }
    
    // Función para aplicar filtro de herramientas
    const applyToolFilter = () => {
      console.log('Tool filter applied:', selectedToolFilter.value)
    }
    
    // Funciones para manejar pedidos
    const viewPedidoDetails = (pedido) => {
      console.log('View pedido details:', pedido)
    }
    
    const resumePedido = (pedido) => {
      console.log('Resume pedido:', pedido)
    }
    
    // Función para formatear fechas
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Función para actualizar fecha y hora
    const updateDateTime = () => {
      const now = new Date()
      currentDate.value = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      currentTime.value = now.toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    // Lifecycle hooks
    onMounted(() => {
      fetchDashboardData()
      updateDateTime()
      timeInterval = setInterval(updateDateTime, 1000)
    })
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })
    
    // Retornar todas las propiedades y métodos reactivos
    return {
      dashboardData,
      loading,
      error,
      isRefreshing,
      unreadNotifications,
      currentDate,
      currentTime,
      selectedToolFilter,
      filteredAvailableTools,
      totalHerramientas,
      showRawData,
      fetchDashboardData,
      refreshData,
      toggleNotifications,
      applyToolFilter,
      viewPedidoDetails,
      resumePedido,
      formatDate,
      getStatusLabel,
      getStatusClass,
      getPriorityClass,
      getToolIcon,
      getUsagePercentage
    }
  }
}
</script>