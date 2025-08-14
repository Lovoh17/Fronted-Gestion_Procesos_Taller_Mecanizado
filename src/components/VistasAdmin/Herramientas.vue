<template>
  <div class="herramientas-container">
    <!-- Header con  -->
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
          <va-button @click="showForm = !showForm" color="primary" icon="plus">
            <span>{{ showForm ? 'Ocultar formulario' : 'Nueva herramienta' }}</span>
          </va-button>
        </div>
      </div>
    </div>

    <!-- Formulario para crear/editar herramienta -->
    <transition name="fade">
      <div v-if="showForm" class="card form-container">
        <h2><i class="fas fa-edit"></i> {{ editing ? 'Editar Herramienta' : 'Nueva Herramienta' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre*</label>
              <input type="text" id="nombre" v-model="herramienta.nombre" required>
            </div>

            <div class="form-group">
              <label for="modelo">Modelo*</label>
              <input type="text" id="modelo" v-model="herramienta.modelo" required>
            </div>

            <div class="form-group">
              <label for="fabricante">Fabricante</label>
              <input type="text" id="fabricante" v-model="herramienta.fabricante">
            </div>

            <div class="form-group">
              <label for="numero_serie">Número de serie</label>
              <input type="text" id="numero_serie" v-model="herramienta.numero_serie">
            </div>

            <div class="form-group">
              <label for="codigo_inventario">Código de inventario</label>
              <input type="text" id="codigo_inventario" v-model="herramienta.codigo_inventario">
            </div>

            <div class="form-group">
              <label for="fecha_adquisicion">Fecha adquisición</label>
              <input type="date" id="fecha_adquisicion" v-model="herramienta.fecha_adquisicion">
            </div>

            <div class="form-group">
              <label for="costo_adquisicion">Costo adquisición ($)</label>
              <input type="number" step="0.01" id="costo_adquisicion" v-model="herramienta.costo_adquisicion">
            </div>

            <div class="form-group">
              <label for="vida_util_horas">Vida útil (horas)</label>
              <input type="number" id="vida_util_horas" v-model="herramienta.vida_util_horas">
            </div>

            <div class="form-group">
              <label for="horas_uso_actual">Horas de uso actual</label>
              <input type="number" id="horas_uso_actual" v-model="herramienta.horas_uso_actual">
            </div>

            <div class="form-group">
              <label for="estado_herramienta_id">Estado</label>
              <select id="estado_herramienta_id" v-model="herramienta.estado_herramienta_id">
                <option value="1">Disponible</option>
                <option value="2">En uso</option>
                <option value="3">Mantenimiento</option>
                <option value="4">Dañado</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="especificaciones_tecnicas">Especificaciones técnicas</label>
              <textarea id="especificaciones_tecnicas" v-model="herramienta.especificaciones_tecnicas"></textarea>
            </div>

            <div class="form-group full-width">
              <label for="notas">Notas</label>
              <textarea id="notas" v-model="herramienta.notas"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <va-button type="submit" color="primary" icon="save">

              {{ editing ? 'Actualizar' : 'Guardar' }}

            </va-button>
            <va-button type="button" @click="resetForm" color="secondary" icon="times">

              Cancelar

            </va-button>
          </div>
        </form>
      </div>
    </transition>

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
          <va-button @click="showDetails(herramienta)" color="info" icon="info-circle">
            Detalles
          </va-button>
          <va-button @click="confirmDelete(herramienta.id)" icon="trash-alt">
            Eliminar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <transition name="modal">
      <div v-if="selectedHerramienta" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Detalles completos</h3>
            <va-button @click="selectedHerramienta = null" class="modal-close" icon="times">
            </va-button>
          </div>
          <div class="modal-content">
            <div class="modal-image"
              :style="{ 'background-image': 'url(' + (selectedHerramienta.imagen_ruta || defaultImage) + ')' }"></div>
            <div class="modal-details">
              <h4>{{ selectedHerramienta.nombre }} - {{ selectedHerramienta.modelo }}</h4>
              <div class="detail-row">
                <span class="detail-label">Fabricante:</span>
                <span>{{ selectedHerramienta.fabricante || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Número de serie:</span>
                <span>{{ selectedHerramienta.numero_serie || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Código inventario:</span>
                <span>{{ selectedHerramienta.codigo_inventario || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha adquisición:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_adquisicion) || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Costo:</span>
                <span>${{ formatCurrency(selectedHerramienta.costo_adquisicion) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valor actual:</span>
                <span>${{ formatCurrency(selectedHerramienta.valor_actual) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span :class="'status-' + selectedHerramienta.estado_herramienta_id">
                  {{ getEstadoName(selectedHerramienta.estado_herramienta_id) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Uso:</span>
                <span>{{ selectedHerramienta.horas_uso_actual || '0' }} / {{ selectedHerramienta.vida_util_horas ||
                  'N/A' }} horas</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Último mantenimiento:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_ultimo_mantenimiento) || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Próximo mantenimiento:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_proximo_mantenimiento) || 'N/A' }}</span>
              </div>
              <div class="detail-row full-width">
                <span class="detail-label">Especificaciones técnicas:</span>
                <pre>{{ formatSpecs(selectedHerramienta.especificaciones_tecnicas) }}</pre>
              </div>
              <div class="detail-row full-width">
                <span class="detail-label">Notas:</span>
                <p>{{ selectedHerramienta.notas || 'Ninguna' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <va-button @click="editHerramienta(selectedHerramienta.id)" color="primary" icon="edit">
              Editar
            </va-button>
            <va-button @click="selectedHerramienta = null" color="secondary" icon="times">
              Cerrar
            </va-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de confirmación  -->
    <va-modal v-model="showDeleteModal" title="Confirmar eliminación" size="small" hide-default-actions>
      <div>
        <p>¿Estás seguro de que deseas eliminar la herramienta <strong>{{ herramientaToDeleteName }}</strong>?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
      <br>
      <template #footer>
        <va-button color="danger" icon="trash-alt" @click="deleteHerramienta">
          Eliminar
        </va-button>
        <va-button color="secondary" icon="times" @click="showDeleteModal = false">
          Cancelar
        </va-button>
      </template>
    </va-modal>
  </div>
</template>
<style src="@/assets/EstiloBase.css" scoped></style>
<script src="./scripts/Herramientas.js"></script>
<style src="@/assets/Herramientas.css" scoped></style>
