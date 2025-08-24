<template>
  <div class="herramientas-container">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Gestión de Herramientas</h1>
            <p class="header-subtitle">Administra el inventario de herramientas</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button @click="showForm = true" color="primary" icon="plus">
            <span>Nueva herramienta</span>
          </va-button>
        </div>
      </div>
    </div>

    <!-- Listado de herramientas -->
    <div class="tools-list">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando herramientas...
      </div>

      <div v-if="!loading && filteredHerramientas.length === 0" class="no-results">
        No se encontraron herramientas
      </div>

      <div v-for="herramienta in filteredHerramientas" :key="herramienta.id" class="tool-card">
        <div class="tool-header">
          <div class="tool-image"
            :style="{ 'background-image': 'url(' + (herramienta.imagen_ruta || defaultImage) + ')' }"></div>
          <div class="tool-title">
            <h3>{{ herramienta.nombre }}</h3>
            <span class="tool-model">{{ herramienta.modelo }}</span>
            <span class="tool-status" :class="'status-' + herramienta.estado_herramienta_id">
              {{ getEstadoName(herramienta.estado_herramienta_id) }}
            </span>
          </div>
        </div>

        <div class="tool-details">
          <div class="detail-item">
            <i class="fas fa-industry"></i>
            <span>{{ herramienta.fabricante || 'Sin fabricante' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-barcode"></i>
            <span>{{ herramienta.codigo_inventario || 'Sin código' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(herramienta.fecha_adquisicion) || 'Sin fecha' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-dollar-sign"></i>
            <span>${{ formatCurrency(herramienta.costo_adquisicion) }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>{{ herramienta.horas_uso_actual || '0' }} / {{ herramienta.vida_util_horas || 'N/A' }} horas</span>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-label">
            Vida útil: {{ calcularPorcentajeUso(herramienta) }}%
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: calcularPorcentajeUso(herramienta) + '%' }"></div>
          </div>
        </div>

        <div class="tool-actions">
          <va-button @click="editHerramienta(herramienta.id)" icon="edit">
            Editar
          </va-button>
          <va-button @click="showDetails(herramienta)" color="info" icon="info">
            Detalles
          </va-button>
          <va-button @click="confirmDelete(herramienta.id)" icon="delete">
            Eliminar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Modal de formulario para crear/editar -->
    <VaModal :model-value="showForm" :title="editing ? 'Editar Herramienta' : 'Nueva Herramienta'" size="large"
      :close-button="false" hide-default-actions @close="closeFormModal" :z-index="10000" :backdrop-z-index="9999">

      <div class="herramienta-form">
        <!-- Información básica -->
        <VaCardTitle>Información Básica</VaCardTitle>
        <VaCardContent>
          <form @submit.prevent="submitForm">
            <div class="form-row">
              <VaInput v-model="herramienta.nombre" label="Nombre *" required class="form-field" />
              <VaInput v-model="herramienta.modelo" label="Modelo *" required class="form-field" />
            </div>

            <div class="form-row">
              <VaInput v-model="herramienta.fabricante" label="Fabricante" class="form-field" />
              <VaInput v-model="herramienta.numero_serie" label="Número de Serie" class="form-field" />
            </div>

            <div class="form-row">
              <VaInput v-model="herramienta.codigo_inventario" label="Código de Inventario" class="form-field" />
              <VaDateInput 
                v-model="herramienta.fecha_adquisicion" 
                label="Fecha de Adquisición" 
                :format="dateFormatFunction"
                class="form-field" 
              />
            </div>
          </form>
        </VaCardContent>

        <!-- Información financiera -->
        <VaCardTitle>Información Financiera</VaCardTitle>
        <VaCardContent>
          <div class="form-row">
            <VaInput v-model="herramienta.costo_adquisicion" label="Costo de Adquisición ($)" type="number" step="0.01"
              class="form-field" />
            <VaInput v-model="herramienta.valor_actual" label="Valor Actual ($)" type="number" step="0.01"
              class="form-field" />
          </div>
        </VaCardContent>

        <!-- Información técnica -->
        <VaCardTitle>Información Técnica</VaCardTitle>
        <VaCardContent>
          <div class="form-row">
            <VaInput v-model="herramienta.vida_util_horas" label="Vida Útil (horas)" type="number" class="form-field" />
            <VaInput v-model="herramienta.horas_uso_actual" label="Horas de Uso Actual" type="number"
              class="form-field" />
          </div>

          <div class="form-row">
            <VaSelect v-model="herramienta.estado_herramienta_id" label="Estado" :options="estadoOptions"
              value-by="value" text-by="label" class="form-field" />
            <div class="form-field"></div>
          </div>

          <div class="form-full-width">
            <VaTextarea v-model="herramienta.especificaciones_tecnicas" label="Especificaciones Técnicas" :min-rows="3"
              :max-rows="6" />
          </div>

          <div class="form-full-width">
            <VaTextarea v-model="herramienta.notas" label="Notas" :min-rows="2" :max-rows="4" />
          </div>
        </VaCardContent>

        <!-- Información de mantenimiento  -->
        <VaCardTitle v-if="editing">Información de Mantenimiento</VaCardTitle>
        <VaCardContent v-if="editing">
          <div class="form-row">
            <VaDateInput 
              v-model="herramienta.fecha_ultimo_mantenimiento" 
              label="Último Mantenimiento"
              :format="dateFormatFunction" 
              class="form-field" 
            />
            <VaDateInput 
              v-model="herramienta.fecha_proximo_mantenimiento" 
              label="Próximo Mantenimiento"
              :format="dateFormatFunction" 
              class="form-field" 
            />
          </div>
        </VaCardContent>
      </div>

      <template #footer>
        <div class="form-actions">
          <VaButton preset="secondary" @click="closeFormModal">
            Cancelar
          </VaButton>
          <VaButton @click="submitForm" color="primary" icon="save">
            {{ editing ? 'Actualizar' : 'Guardar' }} Herramienta
          </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Modal de detalles -->
    <ModalDetallesHerramienta :herramienta="selectedHerramienta" :default-image="defaultImage"
      @cerrar="closeDetailsModal" @editar="handleEditFromModal" />

    <!-- Modal de confirmación -->
    <VaModal v-model="showDeleteModal" title="Confirmar eliminación" size="small" hide-default-actions>
      <div>
        <p>¿Estás seguro de que deseas eliminar la herramienta <strong>{{ herramientaToDeleteName }}</strong>?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
      <template #footer>
        <VaButton color="danger" icon="trash-alt" @click="deleteHerramienta">
          Eliminar
        </VaButton>
        <VaButton preset="secondary" @click="showDeleteModal = false">
          Cancelar
        </VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style src="@/assets/EstiloBase.css" scoped></style>
<script src="./scripts/Herramientas.js"></script>
<style src="@/assets/Herramientas.css" scoped></style>