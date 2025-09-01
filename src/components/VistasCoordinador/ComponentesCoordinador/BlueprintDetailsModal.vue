<template>
  <va-modal v-model="isOpen" hide-default-actions no-padding blur @update:model-value="handleModalChange">
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-drafting-compass mr-2"></i>
          Detalles del Plano y Herramienta
        </h3>
      </div>
    </template>

    <div class="modal-content" v-if="selectedItem">
      <!-- Información del Plano -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-blueprint mr-2"></i>
          Información del Plano
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Código:</label>
            <span class="value">{{ selectedItem.plano.codigo }}</span>
          </div>
          <div class="info-item">
            <label>Versión:</label>
            <span class="value">{{ selectedItem.plano.version || 'No especificada' }}</span>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <label>Descripción:</label>
            <span class="value">{{ selectedItem.plano.descripcion || 'Sin descripción disponible' }}</span>
          </div>
        </div>
      </div>

      <!-- Información de la Herramienta -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-tools mr-2"></i>
          Información de la Herramienta
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Nombre:</label>
            <span class="value">{{ selectedItem.herramienta.nombre }}</span>
          </div>
          <div class="info-item">
            <label>Código:</label>
            <span class="value">{{ selectedItem.herramienta.codigo }}</span>
          </div>
          <div class="info-item">
            <label>Estado:</label>
            <span :class="getStatusBadgeClass(selectedItem.herramienta.estado)">
              <i class="fas fa-circle mr-1"></i>
              {{ selectedItem.herramienta.estado }}
            </span>
          </div>
          <div class="info-item">
            <label>Tipo:</label>
            <span class="value type-badge">
              <i class="fas fa-tag mr-1"></i>
              {{ selectedItem.herramienta.tipo || 'No especificado' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Especificaciones de Uso -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-cogs mr-2"></i>
          Especificaciones de Uso
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Cantidad Necesaria:</label>
            <span class="value usage-value">
              <i class="fas fa-calculator mr-1"></i>
              {{ selectedItem.cantidad_necesaria }} unidades
            </span>
          </div>
          <div class="info-item">
            <label>Tiempo Estimado:</label>
            <span class="value time-value">
              <i class="fas fa-clock mr-1"></i>
              {{ selectedItem.tiempo_estimado_uso }} horas
            </span>
          </div>
          <div class="info-item" v-if="selectedItem.notas" style="grid-column: 1 / -1;">
            <label>Notas:</label>
            <span class="value">{{ selectedItem.notas }}</span>
          </div>
        </div>
      </div>

      <!-- Vista Previa del Plano -->
      <div class="product-section" v-if="selectedItem.plano.imagen_url">
        <h4 class="section-title">
          <i class="fas fa-image mr-2"></i>
          Vista Previa del Plano
        </h4>
        <div class="blueprint-preview-container">
          <div class="preview-wrapper">
            <img 
              :src="selectedItem.plano.imagen_url" 
              :alt="`Plano ${selectedItem.plano.codigo}`"
              class="preview-image"
              @error="onImageError"
            >
          </div>
        </div>
      </div>

      <!-- Información Adicional -->
      <div class="product-section" v-if="selectedItem.created_at || selectedItem.updated_at">
        <h4 class="section-title">
          <i class="fas fa-calendar mr-2"></i>
          Información de Registro
        </h4>
        <div class="info-grid">
          <div class="info-item" v-if="selectedItem.created_at">
            <label>Fecha de Creación:</label>
            <span class="value">
              <i class="fas fa-calendar-plus mr-1"></i>
              {{ formatDate(selectedItem.created_at) }}
            </span>
          </div>
          <div class="info-item" v-if="selectedItem.updated_at">
            <label>Última Actualización:</label>
            <span class="value">
              <i class="fas fa-calendar-edit mr-1"></i>
              {{ formatDate(selectedItem.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <va-button color="secondary" @click="closeModal" icon="close">
          Cerrar
        </va-button>
        <va-button color="primary" @click="editBlueprint" icon="edit" :disabled="!canEdit">
          Editar Plano
        </va-button>
        <va-button color="success" @click="useBlueprint" icon="play_arrow" :disabled="!canUse">
          Usar en Producción
        </va-button>
      </div>
    </template>
  </va-modal>
</template>

<script>
export default {
  name: 'BlueprintDetailsModal',
  props: {
    selectedItem: {
      type: Object,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    canUse: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'edit', 'use'],
  computed: {
    isOpen: {
      get() {
        return !!this.selectedItem;
      },
      set(value) {
        if (!value) {
          this.closeModal();
        }
      }
    }
  },
  methods: {
    handleModalChange(isOpen) {
      if (!isOpen) {
        this.closeModal();
      }
    },
    
    closeModal() {
      this.$emit('close');
    },
    
    editBlueprint() {
      this.$emit('edit', this.selectedItem);
    },
    
    useBlueprint() {
      this.$emit('use', this.selectedItem);
    },
    
    getStatusBadgeClass(estado) {
      const statusClasses = {
        'activo': 'status-badge active-status',
        'inactivo': 'status-badge inactive-status',
        'mantenimiento': 'status-badge maintenance-status',
        'disponible': 'status-badge active-status',
        'en_uso': 'status-badge in-use-status'
      };
      
      return statusClasses[estado?.toLowerCase()] || 'status-badge default-status';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'No disponible';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Fecha inválida';
      }
    },
    
    onImageError(event) {
      event.target.src = '/placeholder-blueprint.png'; // Imagen de placeholder
      event.target.alt = 'Imagen no disponible';
    }
  }
}
</script>

<style >
/* ========== ESTILOS BASE DEL MODAL ========== */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-title {
  display: flex;
  align-items: center;
  color: #1f2937;
}

.modal-title i {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
  width: 100%;
  box-sizing: border-box;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: #f8fafc;
  width: 100%;
  box-sizing: border-box;
}

/* ========== ESTILOS ESPECÍFICOS DEL BLUEPRINT ========== */
.product-section {
  margin-bottom: 2rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.product-section:last-child {
  margin-bottom: 0;
}

.section-title {
  background-color: #f8fafc;
  padding: 1rem 1.25rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.section-title i {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.25rem;
  width: 100%;
  box-sizing: border-box;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  box-sizing: border-box;
}

.info-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item .value {
  color: #1f2937;
  font-weight: 500;
  display: flex;
  align-items: center;
  font-size: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.info-item .value i {
  margin-right: 0.5rem;
  color: #6b7280;
  flex-shrink: 0;
}

/* ========== BADGES Y ESTADOS ========== */
.type-badge {
  background-color: #eff6ff;
  color: #1d4ed8;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  border: 1px solid #dbeafe;
  width: fit-content;
}

.usage-value {
  font-weight: 600;
  background-color: #f0f9ff;
  color: #0369a1;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #bae6fd;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.time-value {
  font-weight: 600;
  background-color: #fefce8;
  color: #a16207;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #fde047;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  text-transform: capitalize;
  width: fit-content;
}

.status-badge.active-status {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-badge.inactive-status {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-badge.maintenance-status {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.status-badge.in-use-status {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-badge.default-status {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* ========== VISTA PREVIA DEL PLANO ========== */
.blueprint-preview-container {
  padding: 1.25rem;
}

.preview-wrapper {
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.preview-wrapper:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
  background: white;
}

.preview-image:hover {
  transform: scale(1.02);
}

/* ========== RESPONSIVE DESIGN ========== */
@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .info-item {
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .va-button {
    width: 100%;
    justify-content: center;
  }

  .preview-image {
    max-height: 250px;
  }
}

/* ========== ANIMACIONES ========== */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========== UTILIDADES ========== */
.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* ========== ESTADOS HOVER ========== */
.info-item:hover .value {
  color: #3b82f6;
  transition: color 0.2s ease;
}

/* ========== SCROLLBAR PERSONALIZADO ========== */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ========== CORRECCIONES ADICIONALES PARA ESPACIOS ========== */
* {
  box-sizing: border-box;
}

.va-modal {
  overflow-x: hidden;
}

.va-modal__dialog {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.modal-content,
.modal-header,
.modal-footer,
.product-section,
.info-grid {
  overflow-x: hidden;
}

.info-item .value {
  min-width: 0;
  max-width: 100%;
  word-break: break-word;
  hyphens: auto;
}
</style>