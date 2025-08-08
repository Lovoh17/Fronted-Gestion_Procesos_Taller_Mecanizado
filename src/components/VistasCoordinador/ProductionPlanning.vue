<template>
  <div class="">
    <Sidebar :role="'coordinator'" />
    <main class="">
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
          <div class="header-section">
            <div class="header-content">
              <div class="header-info">
                <div class="header-icon">
                  <i class="fas fa-boxes-stacked"></i>
                </div>
                <div class="header-text">
                  <h1 class="header-title">Calendario de producción</h1>
                  <p class="header-subtitle">Controla tu inventario y mantén el stock siempre actualizado</p>
                </div>
              </div>
            </div>
          </div>
          
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
              <div v-for="(day, index) in diasCalendario" :key="index" class="dia" :class="{
                'dia-vacio': !day,
                'dia-hoy': esHoy(day),
                'dia-con-pedidos': day && getPedidosDelDia(day).length > 0
              }">
                <div v-if="day" class="dia-contenido">
                  <div class="dia-numero" :class="{ 'hoy': esHoy(day) }">
                    {{ day }}
                    <span v-if="esHoy(day)" class="hoy-label">(Hoy)</span>
                  </div>

                  <div class="pedidos-dia">
                    <div v-for="pedido in getPedidosDelDia(day)" :key="pedido.id" class="pedido-item"
                      :class="estados[pedido.estado_id]?.class || 'estado-default'" :title="obtenerTooltip(pedido)">
                      <div class="pedido-header">
                        <span class="pedido-codigo">{{ pedido.codigo_pedido }}</span>
                        <i :class="obtenerIconoEstado(pedido.estado_id)"></i>
                      </div>
                      <div class="pedido-proyecto">
                        {{ pedido.proyecto_asociado }}
                      </div>
                      <div v-if="pedido.prioridad" class="pedido-prioridad" :class="prioridades[pedido.prioridad]?.class">
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
    </main>
  </div>
</template>

<script src="./scripts/PedidosCalendario.js"></script>

<style src="./styles/PedidosCalendario.css" scoped></style>