<template>
  <div class="operario-trabajos">
    <!-- Encabezado de página -->
    <div class="page-header">
      <div class="header-title">
        <i class="fas fa-tasks"></i>
        <h1>Mis Trabajos Asignados</h1>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="loadTrabajos" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <div class="stat-card stat-pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ trabajosPendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      
      <div class="stat-card stat-progress">
        <div class="stat-icon">
          <i class="fas fa-cog"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ trabajosEnProceso }}</div>
          <div class="stat-label">En Proceso</div>
        </div>
      </div>
      
      <div class="stat-card stat-completed">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ trabajosCompletados }}</div>
          <div class="stat-label">Completados Hoy</div>
        </div>
      </div>
    </div>

    <!-- Sección principal de trabajos -->
    <div class="works-section">
      <div class="section-header">
        <h2>Lista de Trabajos</h2>
        <div class="section-filters">
          <select v-model="filtroEstado" @change="filtrarTrabajos" class="form-select">
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
        <div 
          v-for="trabajo in trabajosFiltrados" 
          :key="trabajo.id"
          class="work-card"
          :class="'work-' + trabajo.estado"
        >
          <div class="work-header">
            <div class="work-status">
              <span class="status-badge" :class="trabajo.estado">
                {{ getEstadoText(trabajo.estado) }}
              </span>
              <span class="work-id">#{{ trabajo.id }}</span>
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
                <span>Fecha: {{ formatDate(trabajo.fechaAsignacion) }}</span>
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
                <span 
                  v-for="herramienta in trabajo.herramientasRequeridas" 
                  :key="herramienta.id"
                  class="tool-tag"
                >
                  {{ herramienta.nombre }}
                </span>
              </div>
            </div>
          </div>

          <div class="work-actions">
            <button 
              v-if="trabajo.estado === 'pendiente'"
              @click="iniciarTrabajo(trabajo.id)"
              class="btn btn-action btn-start"
            >
              <i class="fas fa-play"></i>
              <span>Iniciar</span>
            </button>
            
            <button 
              v-if="trabajo.estado === 'en_proceso'"
              @click="completarTrabajo(trabajo.id)"
              class="btn btn-action btn-complete"
            >
              <i class="fas fa-check"></i>
              <span>Completar</span>
            </button>
            
            <button 
              @click="verDetalles(trabajo)"
              class="btn btn-action btn-details"
            >
              <i class="fas fa-eye"></i>
              <span>Ver Detalles</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Trabajo</h3>
          <button class="btn-close" @click="closeModal">
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
            <label>Fecha de asignación:</label>
            <span>{{ formatDate(trabajoSeleccionado.fechaAsignacion) }}</span>
          </div>
          <div class="detail-row">
            <label>Tiempo estimado:</label>
            <span>{{ trabajoSeleccionado.tiempoEstimado }} horas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const trabajos = ref([]);
const filtroEstado = ref('');
const showModal = ref(false);
const trabajoSeleccionado = ref(null);

// Computed properties
const trabajosPendientes = computed(() => 
  trabajos.value.filter(t => t.estado === 'pendiente').length
);

const trabajosEnProceso = computed(() => 
  trabajos.value.filter(t => t.estado === 'en_proceso').length
);

const trabajosCompletados = computed(() => 
  trabajos.value.filter(t => t.estado === 'completado' && isToday(t.fechaCompletado)).length
);

const trabajosFiltrados = computed(() => {
  if (!filtroEstado.value) return trabajos.value;
  return trabajos.value.filter(t => t.estado === filtroEstado.value);
});

// Methods
const loadTrabajos = async () => {
  try {
    loading.value = true;
    const operarioId = authStore.user?.id;
    
    const response = await fetch(`/api/Trabajos/Operario/${operarioId}`);
    if (!response.ok) throw new Error('Error al cargar trabajos');
    
    trabajos.value = await response.json();
  } catch (error) {
    console.error('Error cargando trabajos:', error);
    // Datos de ejemplo para desarrollo
    trabajos.value = [
      {
        id: 1,
        titulo: 'Reparación de Motor',
        descripcion: 'Revisar y reparar motor de vehículo modelo 2020',
        estado: 'pendiente',
        prioridad: 'alta',
        fechaAsignacion: '2024-06-20',
        tiempoEstimado: 4,
        cliente: 'Juan Pérez',
        herramientasRequeridas: [
          { id: 1, nombre: 'Llave inglesa' },
          { id: 2, nombre: 'Destornillador' }
        ]
      },
      {
        id: 2,
        titulo: 'Cambio de Aceite',
        descripcion: 'Cambio de aceite y filtro estándar',
        estado: 'en_proceso',
        prioridad: 'media',
        fechaAsignacion: '2024-06-21',
        tiempoEstimado: 1,
        cliente: 'María González',
        herramientasRequeridas: [
          { id: 3, nombre: 'Llave de filtro' }
        ]
      }
    ];
  } finally {
    loading.value = false;
  }
};

const iniciarTrabajo = async (trabajoId) => {
  try {
    const response = await fetch(`/api/Trabajos/${trabajoId}/iniciar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const trabajo = trabajos.value.find(t => t.id === trabajoId);
      if (trabajo) trabajo.estado = 'en_proceso';
    }
  } catch (error) {
    console.error('Error iniciando trabajo:', error);
  }
};

const completarTrabajo = async (trabajoId) => {
  try {
    const response = await fetch(`/api/Trabajos/${trabajoId}/completar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const trabajo = trabajos.value.find(t => t.id === trabajoId);
      if (trabajo) {
        trabajo.estado = 'completado';
        trabajo.fechaCompletado = new Date().toISOString();
      }
    }
  } catch (error) {
    console.error('Error completando trabajo:', error);
  }
};

const verDetalles = (trabajo) => {
  trabajoSeleccionado.value = trabajo;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  trabajoSeleccionado.value = null;
};

const getEstadoClass = (estado) => {
  return `estado-${estado}`;
};

const getEstadoText = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado'
  };
  return estados[estado] || estado;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

const isToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

const filtrarTrabajos = () => {
  // La filtración se maneja automáticamente por el computed property
};

onMounted(() => {
  loadTrabajos();
});
</script>

<style scoped>
/* Estilos base */
.operario-trabajos {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
}

/* Encabezado */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-title i {
  font-size: 1.5rem;
  color: #3498db;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-right: 1rem;
  font-size: 1.25rem;
  color: white;
}

.stat-pending .stat-icon {
  background-color: #f39c12;
}

.stat-progress .stat-icon {
  background-color: #3498db;
}

.stat-completed .stat-icon {
  background-color: #2ecc71;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
}

/* Sección principal */
.works-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
}

/* Estados */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-state i,
.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #7f8c8d;
}

.loading-state p,
.empty-state p {
  margin: 0;
  color: #7f8c8d;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

/* Grid de trabajos */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.work-card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.work-pending {
  border-left: 4px solid #f39c12;
}

.work-progress {
  border-left: 4px solid #3498db;
}

.work-completed {
  border-left: 4px solid #2ecc71;
}

.work-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.work-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.en_proceso {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.completado {
  background-color: #d4edda;
  color: #155724;
}

.work-id {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

.work-priority {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.work-priority.alta {
  color: #dc3545;
}

.work-priority.media {
  color: #ffc107;
}

.work-priority.baja {
  color: #28a745;
}

.work-body {
  padding: 1.25rem;
}

.work-title {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.work-description {
  margin: 0 0 1rem;
  color: #6c757d;
  line-height: 1.5;
  font-size: 0.9375rem;
}

.work-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.detail-item i {
  width: 1rem;
  text-align: center;
  color: #7f8c8d;
}

.work-tools h4 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-tag {
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #495057;
}

.work-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-action {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.btn-start {
  background-color: #28a745;
  color: white;
}

.btn-start:hover {
  background-color: #218838;
}

.btn-complete {
  background-color: #17a2b8;
  color: white;
}

.btn-complete:hover {
  background-color: #138496;
}

.btn-details {
  background-color: #6c757d;
  color: white;
}

.btn-details:hover {
  background-color: #5a6268;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body .detail-row {
  display: flex;
  margin-bottom: 1rem;
}

.modal-body .detail-row label {
  font-weight: 600;
  color: #495057;
  width: 140px;
}

.modal-body .detail-row span {
  flex: 1;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .works-grid {
    grid-template-columns: 1fr;
  }
  
  .work-actions {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
  }
  
  .modal-body .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .modal-body .detail-row label {
    width: 100%;
  }
}
</style>