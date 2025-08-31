<template>
  <div class="operario-trabajos-container">
    <!-- Header con título y acciones -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Mis Pedidos Asignados</h1>
            <p class="header-subtitle">Gestiona y actualiza el estado de tus pedidos</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button @click="loadDashboard" :disabled="loading" color="#003366" icon="sync" :loading="loading">
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </va-button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de estadísticas  -->
    <div class="stats-container">
      <div class="stat-card stat-pending">
        <div class="stat-trend">
        </div>
        <div class="stat-card-content">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3>{{ pedidosDesconocidos }}</h3>
            <p>Pendientes</p>
          </div>
        </div>
      </div>

      <div class="stat-card stat-progress">
        <div class="stat-trend">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-card-content">
          <div class="stat-icon">
            <i class="fas fa-cog"></i>
          </div>
          <div class="stat-info">
            <h3>{{ pedidosEnProceso }}</h3>
            <p>En Proceso</p>
          </div>
        </div>
      </div>

      <div class="stat-card stat-completed">
        <div class="stat-trend">
          <i class="fas fa-check"></i>
        </div>
        <div class="stat-card-content">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ pedidosCompletados }}</h3>
            <p>Completados</p>
          </div>
        </div>
      </div>

      <div class="stat-card stat-tools">
        <div class="stat-trend">
          <i class="fas fa-tools"></i>
        </div>
        <div class="stat-card-content">
          <div class="stat-icon">
            <i class="fas fa-wrench"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalHerramientas }}</h3>
            <p>Herramientas Asignadas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y lista de pedidos -->
    <div class="works-section">
      <div class="section-header">
        <h2>Lista de Pedidos</h2>
        <div class="filter-container">
          <select v-model="filtroEstado" @change="filtrarPedidos" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="desconocido">Pendientes</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completados</option>
          </select>
        </div>
      </div>

      <!-- Estados de carga -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando pedidos...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error al cargar datos</h3>
        <p>{{ error }}</p>
        <va-button @click="loadDashboard" color="primary">
          Reintentar
        </va-button>
      </div>

      <div v-else-if="pedidosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No hay pedidos asignados</h3>
        <p>No tienes pedidos asignados en este momento.</p>
      </div>

      <!-- Grid de pedidos -->
      <div v-else class="works-grid">
        <div v-for="pedido in pedidosFiltrados" :key="pedido.asignacionId" class="work-card" :class="'work-' + getEstadoClass(pedido.estado)">
          <div class="work-header">
            <div class="work-meta">
              <span class="work-id">Asignación #{{ pedido.asignacionId }}</span>
              <span class="work-status" :class="getEstadoClass(pedido.estado)">
                {{ getEstadoText(pedido.estado) }}
              </span>
            </div>
            <div class="work-priority" :class="getPrioridad(pedido)">
              <i class="fas fa-exclamation-circle"></i>
              {{ getPrioridad(pedido) }}
            </div>
          </div>

          <div class="work-body">
            <h3 class="work-title">Pedido #{{ pedido.pedidoId }}</h3>
            <p class="work-description">Pedido asignado para procesamiento</p>

            <div class="work-details">
              <div class="detail-item">
                <i class="fas fa-hashtag"></i>
                <span>ID Asignación: {{ pedido.asignacionId }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-shopping-cart"></i>
                <span>ID Pedido: {{ pedido.pedidoId }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-info-circle"></i>
                <span>Estado: {{ getEstadoText(pedido.estado) }}</span>
              </div>
            </div>
          </div>

          <div class="work-actions">
            <va-button v-if="pedido.estado === 'desconocido'" @click="iniciarPedido(pedido)" color="success">
              Iniciar
            </va-button>

            <va-button v-if="pedido.estado === 'en_proceso'" @click="completarPedido(pedido)" color="primary"
              icon="check">
              Completar
            </va-button>

            <va-button @click="verDetalles(pedido)" color="secondary">
              Detalles
            </va-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Herramientas -->
    <div class="tools-section" v-if="dashboardData?.herramientas">
      <div class="section-header">
        <h2>Herramientas Asignadas</h2>
        <span class="tools-count">Total: {{ totalHerramientas }}</span>
      </div>

      <div v-if="dashboardData.herramientas.detalle.length === 0" class="empty-state">
        <i class="fas fa-tools"></i>
        <h3>No hay herramientas asignadas</h3>
        <p>No tienes herramientas específicas asignadas actualmente.</p>
      </div>

      <div v-else class="tools-grid">
        <div v-for="herramienta in dashboardData.herramientas.detalle" :key="herramienta.id" class="tool-card">
          <div class="tool-icon">
            <i class="fas fa-wrench"></i>
          </div>
          <div class="tool-info">
            <h4>{{ herramienta.nombre || 'Herramienta' }}</h4>
            <p>{{ herramienta.descripcion || 'Sin descripción' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Pedido</h3>
          <va-button @click="closeModal" preset="plain" color="secondary" icon="times">
          </va-button>
        </div>
        <div class="modal-body" v-if="pedidoSeleccionado">
          <div class="detail-row">
            <label>ID Asignación:</label>
            <span>#{{ pedidoSeleccionado.asignacionId }}</span>
          </div>
          <div class="detail-row">
            <label>ID Pedido:</label>
            <span>#{{ pedidoSeleccionado.pedidoId }}</span>
          </div>
          <div class="detail-row">
            <label>Estado:</label>
            <span class="status-badge" :class="getEstadoClass(pedidoSeleccionado.estado)">
              {{ getEstadoText(pedidoSeleccionado.estado) }}
            </span>
          </div>
          <div class="detail-row">
            <label>Prioridad:</label>
            <span class="priority-badge" :class="getPrioridad(pedidoSeleccionado)">
              {{ getPrioridad(pedidoSeleccionado) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import useDashboard from './scripts/dashboard.js';
export default defineComponent({
  name: 'Principal',
  setup() {
    const dashboard = useDashboard();
    return {
      ...dashboard
    };
  }
});
</script>

<style src="src/assets/StyleOperario/DashboardOperarioStyle.css" scoped></style>