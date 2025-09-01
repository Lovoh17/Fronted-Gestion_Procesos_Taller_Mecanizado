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
            <h1 class="header-title">Mis Trabajos Asignados</h1>
            <p class="header-subtitle">Gestiona y actualiza el estado de tus tareas</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-modern btn-primary" @click="loadTrabajos" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de estadísticas  -->
    <div class="stats-container">
      <div class="stat-card stat-pending">
        <div class="stat-trend">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="stat-card-content">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3>{{ trabajosPendientes }}</h3>
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
            <h3>{{ trabajosEnProceso }}</h3>
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
            <h3>{{ trabajosCompletados }}</h3>
            <p>Completados Hoy</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y lista de trabajos -->
    <div class="works-section">
      <div class="section-header">
        <h2>Lista de Trabajos</h2>
        <div class="filter-container">
          <select v-model="filtroEstado" @change="filtrarTrabajos" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completados</option>
          </select>
        </div>
      </div>

      <!-- Estados de carga -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando trabajos...</p>
      </div>

      <div v-else-if="trabajosFiltrados.length === 0" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No hay trabajos asignados</h3>
        <p>No tienes trabajos asignados en este momento.</p>
      </div>

      <!-- Grid de trabajos -->
      <div v-else class="works-grid">
        <div v-for="trabajo in trabajosFiltrados" :key="trabajo.id" class="work-card" :class="'work-' + trabajo.estado">
          <div class="work-header">
            <div class="work-meta">
              <span class="work-id">#{{ trabajo.id }}</span>
              <span class="work-status" :class="trabajo.estado">
                {{ getEstadoText(trabajo.estado) }}
              </span>
            </div>
            <div class="work-priority" :class="trabajo.prioridad">
              <i class="fas fa-exclamation-circle"></i>
              {{ trabajo.prioridad }}
            </div>
          </div>

          <div class="work-body">
            <h3 class="work-title">{{ trabajo.titulo }}</h3>
            <p class="work-description">{{ trabajo.descripcion }}</p>

            <div class="work-details">
              <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Asignado: {{ formatDate(trabajo.fechaAsignacion) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>Tiempo estimado: {{ trabajo.tiempoEstimado }}h</span>
              </div>
              <div class="detail-item" v-if="trabajo.cliente">
                <i class="fas fa-user"></i>
                <span>Cliente: {{ trabajo.cliente }}</span>
              </div>
            </div>

            <div class="work-tools" v-if="trabajo.herramientasRequeridas?.length">
              <h4>Herramientas requeridas:</h4>
              <div class="tools-list">
                <span v-for="herramienta in trabajo.herramientasRequeridas" :key="herramienta.id" class="tool-tag">
                  {{ herramienta.nombre }}
                </span>
              </div>
            </div>
          </div>

          <div class="work-actions">
            <button v-if="trabajo.estado === 'pendiente'" @click="iniciarTrabajo(trabajo.id)"
              class="action-btn btn-start">
              <i class="fas fa-play"></i>
              <span>Iniciar</span>
            </button>

            <button v-if="trabajo.estado === 'en_proceso'" @click="completarTrabajo(trabajo.id)"
              class="action-btn btn-complete">
              <i class="fas fa-check"></i>
              <span>Completar</span>
            </button>

            <button @click="verDetalles(trabajo)" class="action-btn btn-details">
              <i class="fas fa-eye"></i>
              <span>Detalles</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Trabajo</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="trabajoSeleccionado">
          <div class="detail-row">
            <label>ID:</label>
            <span>#{{ trabajoSeleccionado.id }}</span>
          </div>
          <div class="detail-row">
            <label>Título:</label>
            <span>{{ trabajoSeleccionado.titulo }}</span>
          </div>
          <div class="detail-row">
            <label>Descripción:</label>
            <span>{{ trabajoSeleccionado.descripcion }}</span>
          </div>
          <div class="detail-row">
            <label>Estado:</label>
            <span class="status-badge" :class="trabajoSeleccionado.estado">
              {{ getEstadoText(trabajoSeleccionado.estado) }}
            </span>
          </div>
          <div class="detail-row">
            <label>Prioridad:</label>
            <span class="priority-badge" :class="trabajoSeleccionado.prioridad">
              {{ trabajoSeleccionado.prioridad }}
            </span>
          </div>
          <div class="detail-row">
            <label>Fecha asignación:</label>
            <span>{{ formatDate(trabajoSeleccionado.fechaAsignacion) }}</span>
          </div>
          <div class="detail-row">
            <label>Tiempo estimado:</label>
            <span>{{ trabajoSeleccionado.tiempoEstimado }} horas</span>
          </div>
          <div class="detail-row" v-if="trabajoSeleccionado.cliente">
            <label>Cliente:</label>
            <span>{{ trabajoSeleccionado.cliente }}</span>
          </div>
          <div class="detail-row" v-if="trabajoSeleccionado.herramientasRequeridas?.length">
            <label>Herramientas:</label>
            <span>
              <span v-for="(herramienta, index) in trabajoSeleccionado.herramientasRequeridas" :key="herramienta.id"
                class="tool-tag">
                {{ herramienta.nombre }}{{ index < trabajoSeleccionado.herramientasRequeridas.length - 1 ? ', ' : '' }}
                  </span>
              </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/Trabajos.js"></script>
<style src="./styles/Trabajos.css" ></style>
<style src="/src/assets/EstiloBase.css" ></style>