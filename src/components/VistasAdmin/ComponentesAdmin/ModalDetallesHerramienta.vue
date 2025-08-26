<template>
  <VaModal :model-value="!!herramienta" title="Detalles de la Herramienta" size="large" :close-button="false"
    hide-default-actions @close="cerrar" :z-index="10000" :backdrop-z-index="9999">
    
    <div v-if="herramienta" class="herramienta-details">
      <!-- Información Principal -->
      <VaCardTitle>Información General</VaCardTitle>
      <VaCardContent>
        <div class="detail-content">
          <!-- Imagen y datos básicos -->
          <div class="detail-header">
            <div class="detail-image" 
              :style="{ 'background-image': 'url(' + (herramienta.imagen_ruta || defaultImage) + ')' }">
            </div>
            <div class="detail-title-section">
              <h4>{{ herramienta.nombre }} - {{ herramienta.modelo }}</h4>
              <span class="tool-status" :class="'status-' + herramienta.estado_herramienta_id">
                {{ getEstadoName(herramienta.estado_herramienta_id) }}
              </span>
            </div>
          </div>

          <!-- Grid de información -->
          <div class="detail-grid">
            <div class="detail-row">
              <VaInput :model-value="herramienta.fabricante || 'N/A'" label="Fabricante" readonly class="detail-field" />
              <VaInput :model-value="herramienta.numero_serie || 'N/A'" label="Número de Serie" readonly class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="herramienta.codigo_inventario || 'N/A'" label="Código de Inventario" readonly class="detail-field" />
              <VaInput :model-value="formatDate(herramienta.fecha_adquisicion) || 'N/A'" label="Fecha de Adquisición" readonly class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="'$' + formatCurrency(herramienta.costo_adquisicion)" label="Costo de Adquisición" readonly class="detail-field" />
              <VaInput :model-value="'$' + formatCurrency(herramienta.valor_actual)" label="Valor Actual" readonly class="detail-field" />
            </div>

            <div class="detail-row">
              <VaInput :model-value="(herramienta.horas_uso_actual || '0') + ' / ' + (herramienta.vida_util_horas || 'N/A') + ' horas'" 
                label="Horas de Uso" readonly class="detail-field" />
              <div class="detail-field">
                <label class="va-input-label">Progreso de Vida Útil</label>
                <div class="progress-container">
                  <VaProgressBar 
                    :model-value="calcularPorcentajeUso(herramienta)"
                    :color="getProgressColor(herramienta)"
                    class="mb-2"
                  />
                  <span class="progress-text">{{ calcularPorcentajeUso(herramienta) }}% utilizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>

      <!-- Información de Mantenimiento -->
      <VaCardTitle>Mantenimiento</VaCardTitle>
      <VaCardContent>
        <div class="detail-row">
          <VaInput :model-value="formatDate(herramienta.fecha_ultimo_mantenimiento) || 'N/A'" 
            label="Último Mantenimiento" readonly class="detail-field" />
          <VaInput :model-value="formatDate(herramienta.fecha_proximo_mantenimiento) || 'N/A'" 
            label="Próximo Mantenimiento" readonly class="detail-field" />
        </div>
      </VaCardContent>

      <!-- Especificaciones y Notas -->
      <VaCardTitle>Detalles Adicionales</VaCardTitle>
      <VaCardContent>
        <div class="detail-full-width">
          <VaTextarea 
            :model-value="formatSpecs(herramienta.especificaciones_tecnicas)" 
            label="Especificaciones Técnicas"
            readonly
            :min-rows="4"
            :max-rows="8"
            class="mb-4"
          />
        </div>
        
        <div class="detail-full-width">
          <VaTextarea 
            :model-value="herramienta.notas || 'Ninguna'"
            label="Notas"
            readonly
            :min-rows="3"
            :max-rows="6"
          />
        </div>
      </VaCardContent>
    </div>

    <template #footer>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="cerrar">
          Cerrar
        </VaButton>
        <VaButton @click="editar" color="primary" icon="edit">
          Editar Herramienta
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
export default {
  name: 'ModalDetallesHerramienta',
  props: {
    herramienta: {
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
      this.$emit('editar', this.herramienta.id);
    },
    getEstadoName(id) {
      const estados = {
        1: 'Disponible',
        2: 'En uso',
        3: 'Mantenimiento',
        4: 'Dañado'
      };
      return estados[id] || 'Desconocido';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES');
    },
    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    formatSpecs(specs) {
      if (!specs) return 'Sin especificaciones técnicas';
      if (typeof specs === 'string') return specs;
      return JSON.stringify(specs, null, 2);
    },
    calcularPorcentajeUso(herramienta) {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0;
      const porcentaje = (herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100;
      return Math.min(100, Math.round(porcentaje));
    },
    getProgressColor(herramienta) {
      const porcentaje = this.calcularPorcentajeUso(herramienta);
      if (porcentaje >= 90) return 'danger';
      if (porcentaje >= 70) return 'warning';
      if (porcentaje >= 50) return 'info';
      return 'success';
    }
  }
};
</script>

<style scoped>
.herramienta-details {
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

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  text-align: center;
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
.status-1 { 
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-2 { 
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-3 { 
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-4 { 
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
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-actions .va-button {
    width: 100%;
  }
}
</style>