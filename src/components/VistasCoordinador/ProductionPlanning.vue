<template>
  <div class="calendario-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin loading-icon"></i>
        <span>Cargando pedidos...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <h3>Error al cargar los pedidos</h3>
        <p>{{ error }}</p>
        <button @click="cargarPedidos" class="btn btn-primary">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Calendario -->
    <div v-else>
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h1>Calendario de Pedidos</h1>
          <div class="fecha-info">
            <i class="fas fa-calendar"></i>
            <span>{{ fechaFormateada }}</span>
          </div>
          <div class="contador-pedidos">
            ({{ pedidos.length }} pedidos totales)
          </div>
        </div>
        <div class="header-right">
          <button @click="navegarMes(-1)" class="btn-nav">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button @click="irHoy" class="btn btn-primary">
            Hoy
          </button>
          <button @click="navegarMes(1)" class="btn-nav">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button @click="cargarPedidos" class="btn btn-success" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="leyenda">
        <h3>Leyenda de Estados:</h3>
        <div class="estados-container">
          <div v-for="(estado, id) in estados" :key="id" class="estado-item">
            <i :class="obtenerIconoEstado(parseInt(id))"></i>
            <span :class="estado.class">{{ estado.nombre }}</span>
          </div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="calendario">
        <!-- Días de la semana -->
        <div class="dias-semana">
          <div v-for="dia in diasSemana" :key="dia" class="dia-semana">
            {{ dia }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="dias-mes">
          <div 
            v-for="(day, index) in diasCalendario" 
            :key="index"
            class="dia"
            :class="{ 
              'dia-vacio': !day, 
              'dia-hoy': esHoy(day),
              'dia-con-pedidos': day && getPedidosDelDia(day).length > 0
            }"
          >
            <div v-if="day" class="dia-contenido">
              <div class="dia-numero" :class="{ 'hoy': esHoy(day) }">
                {{ day }}
                <span v-if="esHoy(day)" class="hoy-label">(Hoy)</span>
              </div>
              
              <div class="pedidos-dia">
                <div 
                  v-for="pedido in getPedidosDelDia(day)" 
                  :key="pedido.id"
                  class="pedido-item"
                  :class="estados[pedido.estado_id]?.class || 'estado-default'"
                  :title="obtenerTooltip(pedido)"
                >
                  <div class="pedido-header">
                    <span class="pedido-codigo">{{ pedido.codigo_pedido }}</span>
                    <i :class="obtenerIconoEstado(pedido.estado_id)"></i>
                  </div>
                  <div class="pedido-proyecto">
                    {{ pedido.proyecto_asociado }}
                  </div>
                  <div v-if="pedido.prioridad" class="pedido-prioridad"
                       :class="prioridades[pedido.prioridad]?.class">
                    Prioridad: {{ prioridades[pedido.prioridad]?.nombre }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen -->
      <div class="resumen">
        <div v-for="(estado, id) in estados" :key="id" class="resumen-item">
          <div class="resumen-header">
            <i :class="obtenerIconoEstado(parseInt(id))"></i>
            <h3>{{ estado.nombre }}</h3>
          </div>
          <div class="resumen-numero">{{ contarPedidosPorEstado(parseInt(id)) }}</div>
          <div class="resumen-label">pedidos</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'PedidosCalendario',
  setup() {
    const currentDate = ref(new Date())
    const pedidos = ref([])
    const loading = ref(true)
    const error = ref(null)

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    const estados = {
      1: { nombre: 'Pendiente', class: 'estado-pendiente' },
      2: { nombre: 'En Proceso', class: 'estado-proceso' },
      3: { nombre: 'Completado', class: 'estado-completado' },
      4: { nombre: 'Cancelado', class: 'estado-cancelado' }
    }

    const prioridades = {
      1: { nombre: 'Alta', class: 'prioridad-alta' },
      2: { nombre: 'Media', class: 'prioridad-media' },
      3: { nombre: 'Baja', class: 'prioridad-baja' }
    }

    // Computed properties
    const fechaFormateada = computed(() => {
      return currentDate.value.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
      })
    })

    const primerDiaDelMes = computed(() => {
      return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
    })

    const ultimoDiaDelMes = computed(() => {
      return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
    })

    const primerDiaDeLaSemana = computed(() => {
      return primerDiaDelMes.value.getDay()
    })

    const diasCalendario = computed(() => {
      const days = []
      const totalDays = ultimoDiaDelMes.value.getDate()
      
      // Días vacíos al inicio
      for (let i = 0; i < primerDiaDeLaSemana.value; i++) {
        days.push(null)
      }
      
      // Días del mes
      for (let day = 1; day <= totalDays; day++) {
        days.push(day)
      }
      
      return days
    })

    // Methods
    const cargarPedidos = async () => {
      try {
        loading.value = true
        error.value = null
        
        const response = await fetch('/api/Pedido')
        if (!response.ok) {
          throw new Error(`Error al cargar los pedidos: ${response.status}`)
        }
        
        const data = await response.json()
        pedidos.value = data
      } catch (err) {
        console.error('Error al cargar pedidos:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const navegarMes = (direccion) => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(), 
        currentDate.value.getMonth() + direccion, 
        1
      )
    }

    const irHoy = () => {
      currentDate.value = new Date()
    }

    const esHoy = (day) => {
      if (!day) return false
      const today = new Date()
      return day === today.getDate() && 
             currentDate.value.getMonth() === today.getMonth() && 
             currentDate.value.getFullYear() === today.getFullYear()
    }

    const getPedidosDelDia = (day) => {
      if (!day) return []
      
      const fecha = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
      const fechaStr = fecha.toISOString().split('T')[0]
      
      return pedidos.value.filter(pedido => {
        const fechaSolicitud = new Date(pedido.fecha_solicitud).toISOString().split('T')[0]
        const fechaRequerida = pedido.fecha_requerida
        const fechaEstimada = pedido.fecha_estimada_entrega
        const fechaCompletado = pedido.fecha_completado ? 
          new Date(pedido.fecha_completado).toISOString().split('T')[0] : null
        
        return fechaSolicitud === fechaStr || 
               fechaRequerida === fechaStr || 
               fechaEstimada === fechaStr ||
               fechaCompletado === fechaStr
      })
    }

    const obtenerIconoEstado = (estadoId) => {
      switch(estadoId) {
        case 1: return 'fas fa-clock'
        case 2: return 'fas fa-box'
        case 3: return 'fas fa-check-circle'
        case 4: return 'fas fa-times-circle'
        default: return 'fas fa-calendar'
      }
    }

    const obtenerTooltip = (pedido) => {
      return `${pedido.codigo_pedido} - ${pedido.notas || 'Sin notas'}`
    }

    const contarPedidosPorEstado = (estadoId) => {
      return pedidos.value.filter(p => p.estado_id === estadoId).length
    }

    // Lifecycle
    onMounted(() => {
      cargarPedidos()
    })

    return {
      currentDate,
      pedidos,
      loading,
      error,
      diasSemana,
      estados,
      prioridades,
      fechaFormateada,
      diasCalendario,
      cargarPedidos,
      navegarMes,
      irHoy,
      esHoy,
      getPedidosDelDia,
      obtenerIconoEstado,
      obtenerTooltip,
      contarPedidosPorEstado
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.calendario-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  min-height: 100vh;
}

/* Loading y Error */
.loading-container, .error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.loading-content, .error-content {
  text-align: center;
}

.loading-icon, .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-icon {
  color: #3b82f6;
}

.error-icon {
  color: #ef4444;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left h1 {
  font-size: 28px;
  font-weight: bold;
  color: #111827;
}

.fecha-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.contador-pedidos {
  font-size: 14px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Botones */
.btn, .btn-nav {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-nav {
  padding: 8px 12px;
  background: #f9fafb;
  color: #374151;
}

.btn-nav:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Leyenda */
.leyenda {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.leyenda h3 {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.estados-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.estado-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Estados */
.estado-pendiente {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.estado-proceso {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.estado-completado {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.estado-cancelado {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.estado-default {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* Prioridades */
.prioridad-alta {
  color: #dc2626;
}

.prioridad-media {
  color: #d97706;
}

.prioridad-baja {
  color: #059669;
}

/* Calendario */
.calendario {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.dias-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9fafb;
}

.dia-semana {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}

.dia-semana:last-child {
  border-right: none;
}

.dias-mes {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.dia {
  min-height: 120px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.dia:nth-child(7n) {
  border-right: none;
}

.dia:hover:not(.dia-vacio) {
  background: #f9fafb;
}

.dia-vacio {
  background: #f9fafb;
}

.dia-hoy {
  background: #eff6ff;
}

.dia-contenido {
  padding: 8px;
  height: 100%;
}

.dia-numero {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #111827;
}

.dia-numero.hoy {
  color: #2563eb;
  font-weight: bold;
}

.hoy-label {
  font-size: 12px;
  margin-left: 4px;
}

.pedidos-dia {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pedido-item {
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.pedido-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.pedido-codigo {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pedido-proyecto {
  font-size: 11px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pedido-prioridad {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

/* Resumen */
.resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.resumen-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.resumen-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.resumen-header h3 {
  font-weight: 500;
  color: #111827;
}

.resumen-numero {
  font-size: 32px;
  font-weight: bold;
  color: #111827;
}

.resumen-label {
  font-size: 14px;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .calendario-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left, .header-right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .dia {
    min-height: 80px;
  }

  .resumen {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .resumen {
    grid-template-columns: 1fr;
  }
  
  .estados-container {
    flex-direction: column;
    gap: 8px;
  }
}
</style>