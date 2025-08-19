<template>
  <div class="herramientas-container">
    <!-- Header con glassmorphism -->
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
          <va-button @click="refreshData" icon="sync-alt" color="secondary" class="refresh-btn">
            Actualizar
          </va-button>
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
              <label for="tipo_herramienta_id">Tipo de herramienta</label>
              <select id="tipo_herramienta_id" v-model="herramienta.tipo_herramienta_id">
                <option value="">Seleccionar tipo</option>
                <option v-for="tipo in tiposHerramienta" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="estado_herramienta_id">Estado</label>
              <select id="estado_herramienta_id" v-model="herramienta.estado_herramienta_id">
                <option value="1">Disponible</option>
                <option value="2">En uso</option>
                <option value="3">Mantenimiento</option>
                <option value="4">Dañado</option>
                <option value="5">Fuera de servicio</option>
              </select>
            </div>

            <div class="form-group">
              <label for="zonas_trabajo_id">Zona de trabajo</label>
              <select id="zonas_trabajo_id" v-model="herramienta.zonas_trabajo_id">
                <option value="">Seleccionar zona</option>
                <option v-for="zona in zonasTrabajos" :key="zona.id" :value="zona.id">
                  {{ zona.nombre }}
                </option>
              </select>
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
              <label for="valor_actual">Valor actual ($)</label>
              <input type="number" step="0.01" id="valor_actual" v-model="herramienta.valor_actual">
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
              <label for="fecha_ultimo_mantenimiento">Último mantenimiento</label>
              <input type="date" id="fecha_ultimo_mantenimiento" v-model="herramienta.fecha_ultimo_mantenimiento">
            </div>

            <div class="form-group">
              <label for="fecha_proximo_mantenimiento">Próximo mantenimiento</label>
              <input type="date" id="fecha_proximo_mantenimiento" v-model="herramienta.fecha_proximo_mantenimiento">
            </div>

            <div class="form-group">
              <label for="imagen_ruta">URL de imagen</label>
              <input type="url" id="imagen_ruta" v-model="herramienta.imagen_ruta" placeholder="https://ejemplo.com/imagen.jpg">
            </div>

            <div class="form-group full-width">
              <label for="especificaciones_tecnicas">Especificaciones técnicas</label>
              <textarea id="especificaciones_tecnicas" v-model="herramienta.especificaciones_tecnicas" rows="3"></textarea>
            </div>

            <div class="form-group full-width">
              <label for="notas">Notas</label>
              <textarea id="notas" v-model="herramienta.notas" rows="3"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <va-button type="submit" color="primary" icon="save" :loading="loading">
              {{ editing ? 'Actualizar' : 'Guardar' }}
            </va-button>
            <va-button type="button" @click="resetForm" color="secondary" icon="times">
              Cancelar
            </va-button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Filtros y Búsqueda -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label for="searchQuery">
            <i class="fas fa-search"></i> Buscar:
          </label>
          <input 
            type="text" 
            id="searchQuery"
            v-model="searchQuery" 
            placeholder="Nombre, modelo, fabricante..."
            class="filter-input">
        </div>
        
        <div class="filter-group">
          <label for="filterEstado">
            <i class="fas fa-filter"></i> Filtrar por estado:
          </label>
          <select 
            id="filterEstado"
            v-model="filterEstado"
            class="filter-select">
            <option value="">Todos los estados</option>
            <option value="1">Disponible</option>
            <option value="2">En uso</option>
            <option value="3">Mantenimiento</option>
            <option value="4">Dañado</option>
            <option value="5">Fuera de servicio</option>
          </select>
        </div>
        
        <div class="filter-group">
          <div class="results-count">
            <i class="fas fa-list-ol"></i>
            <span>Total: {{ filteredHerramientas.length }} herramientas</span>
          </div>
        </div>
        
        <div class="filter-actions">
          <va-button 
            @click="searchQuery = ''; filterEstado = ''" 
            icon="times" 
            size="small"
            color="secondary">
            Limpiar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Grid de herramientas mejorado -->
    <div class="tools-list">
      <div v-if="loading" class="loading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Cargando herramientas...</p>
      </div>

      <div v-if="!loading && filteredHerramientas.length === 0" class="no-results">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
        <p>No se encontraron herramientas</p>
        <va-button v-if="searchQuery || filterEstado" @click="searchQuery = ''; filterEstado = ''" color="primary">
          Ver todas las herramientas
        </va-button>
      </div>

      <div v-for="(herramienta, index) in filteredHerramientas" 
           :key="herramienta.id" 
           class="tool-card"
           :style="{ 'animation-delay': `${index * 0.1}s` }">
        
        <div class="tool-header">
          <!-- Título superpuesto -->
          <div class="tool-title">
            <h3>{{ herramienta.nombre }}</h3>
            <span class="tool-model">{{ herramienta.modelo }}</span>
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

        <!-- Barra de progreso de vida útil -->
        <div class="progress-container" v-if="herramienta.vida_util_horas">
          <div class="progress-label">
            <span>Vida útil</span>
            <span>{{ calcularPorcentajeUso(herramienta) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" 
                 :style="{ 
                   width: calcularPorcentajeUso(herramienta) + '%',
                   backgroundColor: calcularPorcentajeUso(herramienta) > 80 ? '#ef4444' : 
                                  calcularPorcentajeUso(herramienta) > 60 ? '#f59e0b' : '#10b981'
                 }"></div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="tool-actions">
          <va-button @click="editHerramienta(herramienta.id)" size="small" color="info">
            Editar
          </va-button>
          <va-button @click="showDetails(herramienta)" color="secondary" size="small">
            Detalles
          </va-button>
          
          <!-- Botones de checkout/checkin según el estado -->
          <va-button 
            v-if="herramienta.estado_herramienta_id === 1" 
            @click="showCheckoutDialog(herramienta.id)" 
            color="success" 
            size="small">
            Ocupar
          </va-button>
          
          <va-button 
            v-if="herramienta.estado_herramienta_id === 2" 
            @click="desOcuparHerramienta(herramienta.id)" 
            color="warning" 
            size="small">
            Liberar
          </va-button>
          
          <va-button @click="confirmDelete(herramienta.id)" color="danger" size="small">
            Eliminar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles mejorado -->
    <transition name="modal">
      <div v-if="selectedHerramienta" class="modal-overlay" @click.self="selectedHerramienta = null">
        <div class="modal-container">
          <div class="modal-header">
            <h3><i class="fas fa-info-circle"></i> Detalles completos</h3>
            <va-button @click="selectedHerramienta = null" class="modal-close" size="small">
            </va-button>
          </div>
          
          <div class="modal-content">
            <div class="modal-image"
                 :style="selectedHerramienta.imagen_ruta ? 
                         { 'background-image': `url(${selectedHerramienta.imagen_ruta})` } : {}">
              <i v-if="!selectedHerramienta.imagen_ruta" :class="getToolIcon(selectedHerramienta.nombre)" style="font-size: 4rem;"></i>
            </div>
            
            <div class="modal-details">
              <div class="modal-title">
                <h4>{{ selectedHerramienta.nombre }} - {{ selectedHerramienta.modelo }}</h4>
                <div class="tool-status" :class="getStatusClass(selectedHerramienta.estado_herramienta_id)">
                  <i :class="getStatusIcon(selectedHerramienta.estado_herramienta_id)"></i>
                  {{ getEstadoName(selectedHerramienta.estado_herramienta_id) }}
                </div>
              </div>

              <div class="detail-sections">
                <div class="detail-section">
                  <h5><i class="fas fa-info"></i> Información General</h5>
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
                </div>

                <div class="detail-section">
                  <h5><i class="fas fa-dollar-sign"></i> Información Financiera</h5>
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
                </div>

                <div class="detail-section">
                  <h5><i class="fas fa-clock"></i> Uso y Mantenimiento</h5>
                  <div class="detail-row">
                    <span class="detail-label">Uso:</span>
                    <span>{{ selectedHerramienta.horas_uso_actual || '0' }} / {{ selectedHerramienta.vida_util_horas || 'N/A' }} horas</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Último mantenimiento:</span>
                    <span>{{ formatDate(selectedHerramienta.fecha_ultimo_mantenimiento) || 'N/A' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Próximo mantenimiento:</span>
                    <span>{{ formatDate(selectedHerramienta.fecha_proximo_mantenimiento) || 'N/A' }}</span>
                  </div>
                </div>

                <div class="detail-section full-width" v-if="selectedHerramienta.especificaciones_tecnicas">
                  <h5><i class="fas fa-cogs"></i> Especificaciones Técnicas</h5>
                  <div class="detail-content">
                    <pre>{{ formatSpecs(selectedHerramienta.especificaciones_tecnicas) }}</pre>
                  </div>
                </div>

                <div class="detail-section full-width" v-if="selectedHerramienta.notas">
                  <h5><i class="fas fa-sticky-note"></i> Notas</h5>
                  <div class="detail-content">
                    <p>{{ selectedHerramienta.notas }}</p>
                  </div>
                </div>
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

    <!-- Modal de confirmación de eliminación -->
    <va-modal v-model="showDeleteModal" title="Confirmar eliminación" size="small" hide-default-actions>
      <div class="delete-confirmation">
        <div class="delete-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p>¿Estás seguro de que deseas eliminar la herramienta <strong>{{ herramientaToDeleteName }}</strong>?</p>
        <p class="warning-text">Esta acción no se puede deshacer.</p>
      </div>
      <template #footer>
        <va-button color="danger" icon="trash-alt" @click="deleteHerramienta" :loading="loading">
          Eliminar
        </va-button>
        <va-button color="secondary" icon="times" @click="showDeleteModal = false">
          Cancelar
        </va-button>
      </template>
    </va-modal>

    <!-- Modal para checkout con usuario -->
    <va-modal v-model="showCheckoutModal" title="Asignar herramienta" size="small" hide-default-actions>
      <div class="checkout-form">
        <div class="checkout-icon">
          <i class="fas fa-hand-paper"></i>
        </div>
        <p>¿A qué usuario deseas asignar esta herramienta?</p>
        <div class="form-group">
          <label for="usuarioCheckout">ID del Usuario:</label>
          <input 
            type="number" 
            id="usuarioCheckout" 
            v-model="usuarioId" 
            placeholder="Ingrese ID del usuario"
            class="checkout-input">
        </div>
      </div>
      <template #footer>
        <va-button 
          color="success" 
          icon="check" 
          @click="confirmCheckout"
          :disabled="!usuarioId"
          :loading="loading">
          Asignar
        </va-button>
        <va-button color="secondary" icon="times" @click="showCheckoutModal = false">
          Cancelar
        </va-button>
      </template>
    </va-modal>
  </div>
</template>

<style src="@/assets/EstiloBase.css" scoped></style>
<script src="./scripts/Herramientas.js"></script>
<style src="@/assets/Herramientas.css" scoped></style>