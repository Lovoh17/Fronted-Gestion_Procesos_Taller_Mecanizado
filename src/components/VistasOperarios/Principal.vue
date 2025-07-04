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
.operario-trabajos-container {
  padding: 2rem;
  max-width: auto;
  margin: 0 auto;
  color: #333;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #003366, #003366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Botones modernos del header */
.btn-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 0.8rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  color: white;
}

.btn-modern i {
  font-size: 1.1rem;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.6s ease;
}

.btn-modern:hover::before {
  left: 100%;
}

.btn-modern.btn-primary {
  background: linear-gradient(135deg, #003366, #003366);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-modern.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-modern.btn-secondary {
  color: #4a5568;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-modern.btn-secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-large {
  padding: 1.2rem 2.4rem;
  font-size: 1.2rem;
}

/* Botones del formulario y acciones principales */
.btn-primary {
  background-color: var(--primary-color) !important;
  color: white !important;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    padding: 0 1rem;
  }

  .header-info {
    flex-direction: column;
    gap: 1rem;
  }

  .header-title {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .header-icon {
    padding: 1rem;
  }

  .header-icon i {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1.5rem 0;
    margin-bottom: 1.5rem;
  }

  .header-title {
    font-size: 1.75rem;
  }

  .btn-modern {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-container h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.title-container i {
  font-size: 1.5rem;
  color: #3498db;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Tarjetas de estadísticas mejoradas - armonizadas con el header */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.2rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color), var(--card-color-light));
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Colores armonizados con el header (#003366) */
.stat-pending {
  --card-color: #003366;
  --card-color-light: #004080;
  --card-bg: rgba(0, 51, 102, 0.1);
}

.stat-progress {
  --card-color: #2d5a87;
  --card-color-light: #4a7ba7;
  --card-bg: rgba(45, 90, 135, 0.1);
}

.stat-completed {
  --card-color: #1e6b4a;
  --card-color-light: #2d8b5f;
  --card-bg: rgba(30, 107, 74, 0.1);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--card-color), var(--card-color-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.stat-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--card-color), var(--card-color-light));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-icon::after {
  opacity: 0.3;
}

.stat-card:hover .stat-icon {
  transform: rotate(10deg) scale(1.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, var(--card-color), var(--card-color-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-info p {
  font-size: 1rem;
  color: #64748b;
  margin: 0.5rem 0 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stat-trend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: var(--card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color);
  font-size: 1.2rem;
  opacity: 0.7;
}

/* Animación de entrada */
.stat-card {
  animation: slideInUp 0.6s ease-out;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-card-content {
    gap: 1rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .stat-info h3 {
    font-size: 2rem;
  }
}

/* Sección de trabajos */
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

/* Reemplaza el estilo actual del filter-select con estos estilos */
.filter-select {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #4a5568;
  /* Color de texto oscuro para mejor contraste */
  font-size: 0.875rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
}

.filter-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
}

/* Estilo para las opciones del select */
.filter-select option {
  background-color: white;
  color: #2d3748;
  padding: 0.5rem;
}

/* Contenedor del select para mejor espaciado */
.filter-container {
  position: relative;
  min-width: 200px;
}

/* Estilo para el hover de las opciones */
.filter-select option:hover {
  background-color: #ebf8ff;
}

/* Estados de carga */
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

.work-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.work-id {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

.work-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.work-status.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.work-status.en_proceso {
  background-color: #d1ecf1;
  color: #0c5460;
}

.work-status.completado {
  background-color: #d4edda;
  color: #155724;
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

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
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

.modal-content {
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.close-btn:hover {
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

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.alta {
  background-color: #f8d7da;
  color: #721c24;
}

.priority-badge.media {
  background-color: #fff3cd;
  color: #856404;
}

.priority-badge.baja {
  background-color: #d4edda;
  color: #155724;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
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

  .action-btn {
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