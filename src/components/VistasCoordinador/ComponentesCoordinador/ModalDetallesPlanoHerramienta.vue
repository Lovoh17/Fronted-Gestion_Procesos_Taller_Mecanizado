<template>
  <VaModal :model-value="!!blueprintItem" title="Detalles del Plano de Herramienta" size="large" :close-button="false"
    hide-default-actions @close="cerrar" :z-index="10000" :backdrop-z-index="9999">

    <div v-if="blueprintItem" class="blueprint-details">
      <!-- Información Principal -->
      <VaCardTitle>Información General</VaCardTitle>
      <VaCardContent>
        <div class="detail-content">
          <!-- Imagen y datos básicos -->
          <div class="detail-header">
            <div class="detail-image"
              :style="{ 'background-image': 'url(' + (blueprintItem.plano.imagen_url || defaultImage) + ')' }">
            </div>
            <div class="detail-title-section">
              <h4>{{ blueprintItem.herramienta.nombre }}</h4>
              <span class="blueprint-code">{{ blueprintItem.plano.codigo }}</span>
              <span class="tool-status" :class="'status-' + blueprintItem.herramienta.estado">
                {{ blueprintItem.herramienta.estado }}
              </span>
            </div>
          </div>

          <!-- Grid de información -->
          <div class="detail-grid">
            <div class="detail-row">
              <VaInput :model-value="blueprintItem.plano.codigo || 'N/A'" label="Código del Plano" readonly
                class="detail-field" />
              <VaInput :model-value="blueprintItem.plano.version || 'N/A'" label="Versión" readonly
                class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="blueprintItem.herramienta.codigo || 'N/A'" label="Código de Herramienta" readonly
                class="detail-field" />
              <VaInput :model-value="blueprintItem.herramienta.estado || 'N/A'" label="Estado de Herramienta" readonly
                class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="blueprintItem.cantidad_necesaria + ' unidades'" label="Cantidad Necesaria" readonly
                class="detail-field" />
              <VaInput :model-value="blueprintItem.tiempo_estimado_uso + ' horas'" label="Tiempo Estimado de Uso"
                readonly class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="formatDate(blueprintItem.fecha_creacion) || 'N/A'" label="Fecha de Creación"
                readonly class="detail-field" />
              <VaInput :model-value="formatDate(blueprintItem.fecha_actualizacion) || 'N/A'"
                label="Última Actualización" readonly class="detail-field" />
            </div>
          </div>
        </div>
      </VaCardContent>

      <!-- Información del Plano -->
      <VaCardTitle>Información del Plano</VaCardTitle>
      <VaCardContent>
        <div class="detail-full-width">
          <VaTextarea :model-value="blueprintItem.plano.descripcion || 'Sin descripción disponible'"
            label="Descripción del Plano" readonly :min-rows="4" :max-rows="8" class="mb-4" />
        </div>
      </VaCardContent>

      <!-- Información de la Herramienta -->
      <VaCardTitle>Detalles de la Herramienta</VaCardTitle>
      <VaCardContent>
        <div class="detail-row">
          <VaInput :model-value="blueprintItem.herramienta.nombre || 'N/A'" label="Nombre de la Herramienta" readonly
            class="detail-field" />
          <VaInput :model-value="blueprintItem.herramienta.modelo || 'N/A'" label="Modelo" readonly
            class="detail-field" />
        </div>
        <div class="detail-row">
          <VaInput :model-value="blueprintItem.herramienta.fabricante || 'N/A'" label="Fabricante" readonly
            class="detail-field" />
          <VaInput :model-value="blueprintItem.herramienta.numero_serie || 'N/A'" label="Número de Serie" readonly
            class="detail-field" />
        </div>
      </VaCardContent>

      <!-- Especificaciones y Notas -->
      <VaCardTitle>Notas y Especificaciones</VaCardTitle>
      <VaCardContent>
        <div class="detail-full-width">
          <VaTextarea :model-value="blueprintItem.notas || 'Sin notas adicionales'" label="Notas del Plano" readonly
            :min-rows="3" :max-rows="6" class="mb-4" />
        </div>

        <div class="detail-full-width" v-if="blueprintItem.herramienta.especificaciones_tecnicas">
          <VaTextarea :model-value="formatSpecs(blueprintItem.herramienta.especificaciones_tecnicas)"
            label="Especificaciones Técnicas de la Herramienta" readonly :min-rows="3" :max-rows="6" />
        </div>
      </VaCardContent>

      <!-- Información de Uso -->
      <VaCardTitle>Información de Uso</VaCardTitle>
      <VaCardContent>
        <div class="usage-info">
          <div class="usage-metric">
            <div class="metric-icon">
              <i class="material-icons">build</i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Cantidad Requerida</span>
              <span class="metric-value">{{ blueprintItem.cantidad_necesaria }} unidades</span>
            </div>
          </div>

          <div class="usage-metric">
            <div class="metric-icon">
              <i class="material-icons">schedule</i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Tiempo Estimado</span>
              <span class="metric-value">{{ blueprintItem.tiempo_estimado_uso }} horas</span>
            </div>
          </div>

          <div class="usage-metric" v-if="blueprintItem.herramienta.horas_uso_actual">
            <div class="metric-icon">
              <i class="material-icons">hourglass_empty</i>
            </div>
            <div class="metric-content">
              <span class="metric-label">Horas Actuales</span>
              <span class="metric-value">{{ blueprintItem.herramienta.horas_uso_actual }} horas</span>
            </div>
          </div>
        </div>
      </VaCardContent>
    </div>

    <template #footer>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="cerrar">
          Cerrar
        </VaButton>
        <VaButton @click="editar" color="primary" icon="edit">
          Editar Plano
        </VaButton>
        <VaButton @click="descargar" color="info" icon="download" v-if="blueprintItem.plano.imagen_url">
          Descargar Plano
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
export default {
  name: 'ModalDetallesPlanoHerramienta',
  props: {
    blueprintItem: {
      type: Object,
      default: null
    },
    defaultImage: {
      type: String,
      default: 'https://via.placeholder.com/300x200?text=Sin+imagen'
    }
  },
  emits: ['cerrar', 'editar'],
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    editar() {
      this.$emit('editar', this.blueprintItem);
    },
    descargar() {
      if (this.blueprintItem.plano.imagen_url) {
        const link = document.createElement('a');
        link.href = this.blueprintItem.plano.imagen_url;
        link.download = `plano_${this.blueprintItem.plano.codigo}.jpg`;
        link.click();
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES');
    },
    formatSpecs(specs) {
      if (!specs) return 'Sin especificaciones técnicas';
      if (typeof specs === 'string') return specs;
      return JSON.stringify(specs, null, 2);
    }
  }
};
</script>

<style scoped>
.blueprint-details {
  max-width: 100%;
}

.detail-content {
  width: 100%;
}

.detail-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.detail-image {
  width: 200px;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
  flex-shrink: 0;
}

.detail-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-title-section h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.blueprint-code {
  font-family: 'Courier New', monospace;
  background: var(--va-background-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--va-text-primary);
  width: fit-content;
}

.tool-status {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-full-width {
  width: 100%;
  margin-bottom: 1rem;
}

.detail-field {
  width: 100%;
}

.detail-grid {
  width: 100%;
}

.usage-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.usage-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--va-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--va-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.metric-value {
  font-size: 1.125rem;
  color: var(--va-text-primary);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.va-input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--va-text-primary);
}

/* Estados de herramientas */
.status-disponible {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-en-uso {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-mantenimiento {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-dañado {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-image {
    width: 100%;
    height: 200px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .detail-title-section h4 {
    font-size: 1.25rem;
  }

  .usage-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-actions .va-button {
    width: 100%;
  }

  .usage-metric {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>