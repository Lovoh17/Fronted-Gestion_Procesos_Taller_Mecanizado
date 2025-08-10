<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ mode === 'create' ? 'Nueva Orden de Trabajo' : 'Editar Orden #' + pedido.codigo_pedido }}</h2>
        <button class="close-btn" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Información básica del pedido -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">assignment</span> Información General
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Código de Pedido *</label>
              <input 
                type="text" 
                v-model="pedido.codigo_pedido" 
                :readonly="mode === 'edit'"
                required
              >
            </div>
            
            <div class="form-group">
              <label>Tipo de Pedido *</label>
              <select v-model="pedido.tipo_pedido_id" required>
                <option value="">Seleccionar tipo</option>
                <option v-for="tipo in tiposPedido" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Prioridad *</label>
              <select v-model="pedido.prioridad" required>
                <option value="1">Alta (1)</option>
                <option value="2">Media-Alta (2)</option>
                <option value="3">Media (3)</option>
                <option value="4">Media-Baja (4)</option>
                <option value="5">Baja (5)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Proyecto Asociado *</label>
              <select v-model="pedido.proyecto_asociado" required>
                <option value="">Seleccionar proyecto</option>
                <option v-for="proyecto in proyectos" :key="proyecto.id" :value="proyecto.id">
                  {{ proyecto.nombre }} - {{ proyecto.cliente }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio *</label>
              <input type="datetime-local" v-model="pedido.fecha_inicio" required @change="checkConflicts">
            </div>
            
            <div class="form-group">
              <label>Fecha Fin *</label>
              <input type="datetime-local" v-model="pedido.fecha_fin" required @change="checkConflicts">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Horas Estimadas *</label>
              <input 
                type="number" 
                v-model="pedido.horas_estimadas" 
                required
                min="1"
                @input="calculateWorkload"
              >
            </div>
            
            <div class="form-group">
              <label>Fecha Requerida *</label>
              <input type="date" v-model="pedido.fecha_requerida" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Costo Estimado</label>
              <input 
                type="number" 
                step="0.01" 
                v-model="pedido.costo_estimado"
                placeholder="0.00"
              >
            </div>
            
            <div class="form-group">
              <label>Precio Final *</label>
              <input 
                type="number" 
                step="0.01" 
                v-model="pedido.precio_final"
                placeholder="0.00"
                required
              >
            </div>
          </div>
        </div>

        <!-- Alertas Contextuales -->
        <div class="alerts-section" v-if="alertas.length > 0">
          <div 
            v-for="alerta in alertas" 
            :key="alerta.id" 
            class="alert-card"
            :class="alerta.tipo"
          >
            <div class="alert-icon">
              <span class="material-icons">{{ getAlertIcon(alerta.tipo) }}</span>
            </div>
            <div class="alert-content">
              <h4>{{ alerta.titulo }}</h4>
              <p>{{ alerta.mensaje }}</p>
              <div class="alert-details" v-if="alerta.detalles">
                <small>{{ alerta.detalles }}</small>
              </div>
            </div>
            <button class="alert-dismiss" @click="dismissAlert(alerta.id)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
        
        <!-- Sección de planos -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">architecture</span> Planos y Documentos
          </h3>
          
          <div class="blueprints-section">
            <div class="file-upload-area" @dragover.prevent @drop.prevent="handleDrop">
              <input type="file" id="blueprint-upload" ref="fileInput" 
                     accept=".pdf" multiple @change="handleFileChange" hidden>
              <label for="blueprint-upload" class="upload-label">
                <span class="material-icons large-icon">cloud_upload</span>
                <p>Arrastra archivos PDF aquí o haz clic para seleccionarlos</p>
                <p class="small-text">Solo se aceptan archivos PDF (máx. 10MB cada uno)</p>
              </label>
            </div>
            
            <div class="uploaded-files" v-if="pedido.planos && pedido.planos.length > 0">
              <div class="file-list-header">
                <span>Archivos adjuntos</span>
                <span>{{ pedido.planos.length }} archivo(s)</span>
              </div>
              
              <div class="file-list">
                <div v-for="(file, index) in pedido.planos" :key="index" class="file-item">
                  <div class="file-info">
                    <span class="material-icons">picture_as_pdf</span>
                    <div>
                      <div class="file-name">{{ file.nombre_archivo }}</div>
                      <div class="file-meta">{{ formatFileSize(file.tamaño) }} • {{ formatDate(file.fecha_subida) }}</div>
                    </div>
                  </div>
                  <button class="icon-btn small" @click="removeBlueprint(index)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sección de asignación de trabajadores mejorada -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">engineering</span> Asignación de Trabajadores
          </h3>
          
          <!-- Resumen de capacidad vs demanda -->
          <div class="workload-summary" v-if="pedido.horas_estimadas">
            <div class="workload-card">
              <div class="workload-item">
                <span class="material-icons">schedule</span>
                <div>
                  <span class="workload-label">Horas Requeridas</span>
                  <span class="workload-value">{{ pedido.horas_estimadas }}h</span>
                </div>
              </div>
              <div class="workload-item">
                <span class="material-icons">group</span>
                <div>
                  <span class="workload-label">Capacidad Disponible</span>
                  <span class="workload-value" :class="{ 'insufficient': capacidadDisponible < pedido.horas_estimadas }">
                    {{ capacidadDisponible }}h
                  </span>
                </div>
              </div>
              <div class="workload-item">
                <span class="material-icons">trending_up</span>
                <div>
                  <span class="workload-label">Estado</span>
                  <span class="workload-status" :class="getWorkloadStatusClass()">
                    {{ getWorkloadStatus() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="loading-message" v-if="loadingUsuarios">
            Cargando usuarios...
          </div>
          
          <div class="workers-section" v-else>
            <!-- Filtros y búsqueda -->
            <div class="workers-filters">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchUsuarios" 
                  placeholder="Buscar trabajadores..."
                  class="search-input"
                >
                <span class="material-icons search-icon">search</span>
              </div>
              
              <div class="filter-tabs">
                <button 
                  class="filter-tab"
                  :class="{ active: workerFilter === 'available' }"
                  @click="workerFilter = 'available'"
                >
                  <span class="material-icons">check_circle</span>
                  Disponibles ({{ availableWorkers.length }})
                </button>
                <button 
                  class="filter-tab"
                  :class="{ active: workerFilter === 'busy' }"
                  @click="workerFilter = 'busy'"
                >
                  <span class="material-icons">schedule</span>
                  Ocupados ({{ busyWorkers.length }})
                </button>
                <button 
                  class="filter-tab"
                  :class="{ active: workerFilter === 'all' }"
                  @click="workerFilter = 'all'"
                >
                  <span class="material-icons">group</span>
                  Todos ({{ allWorkers.length }})
                </button>
              </div>
            </div>

            <div class="workers-grid">
              <div class="worker-card" v-for="usuario in filteredUsuarios" :key="usuario.id">
                <div class="worker-header">
                  <div class="worker-avatar">
                    <span class="material-icons">person</span>
                  </div>
                  <div class="worker-basic-info">
                    <h4>{{ usuario.nombres }} {{ usuario.apellidos }}</h4>
                    <p class="worker-role">{{ usuario.puesto?.nombre || 'Sin puesto definido' }}</p>
                    <p class="worker-contact">{{ usuario.email }}</p>
                  </div>
                  <div class="worker-status">
                    <span class="status-badge" :class="getWorkerStatusClass(usuario)">
                      {{ getWorkerStatus(usuario) }}
                    </span>
                  </div>
                </div>

                <div class="worker-details">
                  <div class="worker-skills" v-if="usuario.habilidades && usuario.habilidades.length > 0">
                    <span class="skills-label">Habilidades:</span>
                    <div class="skills-tags">
                      <span v-for="skill in usuario.habilidades" :key="skill" class="skill-tag">
                        {{ skill }}
                      </span>
                    </div>
                  </div>

                  <div class="worker-availability" v-if="usuario.disponibilidad">
                    <div class="availability-item">
                      <span class="material-icons">schedule</span>
                      <span>{{ usuario.disponibilidad.horas_disponibles }}h disponibles</span>
                    </div>
                    <div class="availability-item" v-if="usuario.conflictos && usuario.conflictos.length > 0">
                      <span class="material-icons">warning</span>
                      <span class="conflict-count">{{ usuario.conflictos.length }} conflicto(s)</span>
                    </div>
                  </div>
                </div>

                <!-- Alertas de conflictos -->
                <div class="worker-conflicts" v-if="usuario.conflictos && usuario.conflictos.length > 0">
                  <div class="conflict-alert">
                    <span class="material-icons">schedule_problem</span>
                    <div class="conflict-details">
                      <h5>Conflictos de Horario</h5>
                      <ul>
                        <li v-for="conflicto in usuario.conflictos" :key="conflicto.id">
                          {{ conflicto.proyecto_nombre }} ({{ formatDateRange(conflicto.fecha_inicio, conflicto.fecha_fin) }})
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="worker-actions">
                  <label class="worker-checkbox">
                    <input 
                      type="checkbox"
                      v-model="pedido.trabajadores_asignados"
                      :value="usuario.id"
                      :disabled="!usuario.disponible"
                    >
                    <span class="checkmark"></span>
                    <span>{{ isWorkerAssigned(usuario.id) ? 'Asignado' : 'Asignar' }}</span>
                  </label>
                  
                  <button 
                    class="view-calendar-btn"
                    @click="viewWorkerCalendar(usuario.id)"
                    :title="`Ver calendario de ${usuario.nombres}`"
                  >
                    <span class="material-icons">calendar_today</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sugerencias alternativas -->
          <div class="suggestions-section" v-if="sugerenciasAlternativas.length > 0">
            <h4 class="suggestions-title">
              <span class="material-icons">lightbulb</span>
              Sugerencias Alternativas
            </h4>
            
            <div class="suggestions-grid">
              <div class="suggestion-card" v-for="sugerencia in sugerenciasAlternativas" :key="sugerencia.id">
                <div class="suggestion-header">
                  <span class="material-icons">{{ getSuggestionIcon(sugerencia.tipo) }}</span>
                  <h5>{{ sugerencia.titulo }}</h5>
                  <span class="suggestion-score">{{ sugerencia.score }}%</span>
                </div>
                <p class="suggestion-description">{{ sugerencia.descripcion }}</p>
                <div class="suggestion-details">
                  <div class="suggestion-pros" v-if="sugerencia.ventajas">
                    <span class="material-icons">check</span>
                    <span>{{ sugerencia.ventajas }}</span>
                  </div>
                  <div class="suggestion-cons" v-if="sugerencia.desventajas">
                    <span class="material-icons">warning</span>
                    <span>{{ sugerencia.desventajas }}</span>
                  </div>
                </div>
                <button class="apply-suggestion-btn" @click="applySuggestion(sugerencia)">
                  Aplicar Sugerencia
                </button>
              </div>
            </div>
          </div>

          <!-- Sección de sobrecarga -->
          <div class="overload-section" v-if="hayRiesgoSobrecarga">
            <div class="overload-alert">
              <div class="overload-header">
                <span class="material-icons">report_problem</span>
                <h4>Riesgo de Sobrecarga Detectado</h4>
              </div>
              <p class="overload-message">
                El proyecto requiere {{ pedido.horas_estimadas }}h, pero el equipo actual solo puede cubrir {{ capacidadDisponible }}h.
                Déficit: <strong>{{ pedido.horas_estimadas - capacidadDisponible }}h</strong>
              </p>
              
              <!-- Card "Contratar Eventual" -->
              <div class="hire-temp-card" v-if="recomendacionTemporal">
                <div class="temp-card-header">
                  <span class="material-icons">person_add</span>
                  <h5>Contratación Temporal Recomendada</h5>
                </div>
                
                <div class="temp-profile">
                  <div class="temp-info">
                    <div class="temp-role">
                      <strong>{{ recomendacionTemporal.perfil }}</strong>
                    </div>
                    <div class="temp-skills">
                      Habilidades: {{ recomendacionTemporal.habilidades.join(', ') }}
                    </div>
                    <div class="temp-duration">
                      Duración estimada: {{ recomendacionTemporal.duracion_dias }} días
                    </div>
                  </div>
                  
                  <div class="temp-cost">
                    <div class="cost-breakdown">
                      <div class="cost-item">
                        <span>Tarifa diaria:</span>
                        <span class="cost-value">${{ recomendacionTemporal.costo_diario }}</span>
                      </div>
                      <div class="cost-item">
                        <span>Costo total:</span>
                        <span class="cost-total">${{ recomendacionTemporal.costo_total }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="temp-actions">
                  <button class="btn secondary" @click="viewTempProfile()">
                    Ver Perfil Completo
                  </button>
                  <button class="btn primary generate-posting-btn" @click="generateJobPosting()">
                    <span class="material-icons">add_circle</span>
                    Generar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sección de herramientas -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">handyman</span> Asignación de Herramientas
          </h3>
          
          <div class="loading-message" v-if="loadingHerramientas">
            Cargando herramientas...
          </div>
          
          <div class="resource-grid" v-else>
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchHerramientas" 
                placeholder="Buscar herramientas..."
                class="search-input"
              >
            </div>
            
            <div class="resource-item" v-for="herramienta in filteredHerramientas" :key="herramienta.id">
              <label class="resource-checkbox">
                <input 
                  type="checkbox" 
                  v-model="pedido.herramientas_asignadas" 
                  :value="herramienta.id"
                  :disabled="!herramienta.disponible"
                >
                <span class="checkmark"></span>
                <span class="resource-name">
                  <span class="material-icons">{{ getHerramientaIcon(herramienta.tipo) }}</span>
                  {{ herramienta.nombre }}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Sección de materiales mejorada -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">inventory</span> Materiales Requeridos
          </h3>
          
          <div class="loading-message" v-if="loadingMateriales">
            Cargando materiales...
          </div>
          
          <div v-else>
            <!-- Filtros y búsqueda -->
            <div class="materials-filter">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchMateriales" 
                  placeholder="Buscar materiales..."
                  class="search-input"
                >
                <span class="material-icons search-icon">search</span>
              </div>
              
              <div class="filter-buttons">
                <button 
                  class="filter-btn"
                  :class="{ active: filterStock === 'all' }"
                  @click="filterStock = 'all'"
                >
                  Todos
                </button>
                <button 
                  class="filter-btn"
                  :class="{ active: filterStock === 'available' }"
                  @click="filterStock = 'available'"
                >
                  Disponibles
                </button>
                <button 
                  class="filter-btn"
                  :class="{ active: filterStock === 'low' }"
                  @click="filterStock = 'low'"
                >
                  Bajo stock
                </button>
              </div>
            </div>
            
            <!-- Materiales disponibles -->
            <div class="available-materials">
              <div class="materials-grid">
                <div 
                  class="material-card" 
                  v-for="material in filteredAvailableMaterials" 
                  :key="material.id"
                  :class="{ 
                    'out-of-stock': material.stock <= 0,
                    'low-stock': material.stock > 0 && material.stock <= material.stock_minimo,
                    'selected': isMaterialSelected(material.id)
                  }"
                >
                  <div class="material-info">
                    <h5>{{ material.nombre }}</h5>
                    <div class="material-meta">
                      <span class="stock-info">
                        <span class="material-icons" v-if="material.stock <= 0">block</span>
                        <span class="material-icons" v-else-if="material.stock <= material.stock_minimo">warning</span>
                        <span class="material-icons" v-else>check_circle</span>
                        {{ material.stock }} {{ material.unidad }}
                      </span>
                      <span v-if="material.stock_minimo" class="min-stock">
                        Mín: {{ material.stock_minimo }}
                      </span>
                    </div>
                    <div class="material-description" v-if="material.descripcion">
                      {{ truncateDescription(material.descripcion) }}
                    </div>
                  </div>
                  
                  <div class="material-actions" v-if="material.stock > 0">
                    <div class="quantity-controls">
                      <button 
                        class="qty-btn" 
                        @click="decrementMaterial(material)"
                        :disabled="getAddedQuantity(material.id) <= 0"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        :value="getAddedQuantity(material.id)"
                        @input="updateMaterialQuantity(material, $event)"
                        min="0"
                        :max="material.stock"
                        class="qty-input"
                        :class="{ 'error': getAddedQuantity(material.id) > material.stock }"
                      >
                      <button 
                        class="qty-btn" 
                        @click="incrementMaterial(material)"
                        :disabled="getAddedQuantity(material.id) >= material.stock"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      class="add-material-btn"
                      @click="toggleMaterial(material)"
                      :class="{ 
                        'added': isMaterialSelected(material.id),
                        'disabled': getAddedQuantity(material.id) <= 0
                      }"
                    >
                      {{ isMaterialSelected(material.id) ? 'Quitar' : 'Agregar' }}
                    </button>
                  </div>
                  <div class="out-of-stock-message" v-else>
                    <span class="material-icons">block</span> Agotado
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Lista de materiales seleccionados -->
            <div class="selected-materials">
              <div class="selected-header">
                <h4>Materiales Seleccionados</h4>
                <span class="total-items">{{ pedido.materiales.length }} material(es)</span>
              </div>
              
              <div v-if="pedido.materiales.length === 0" class="empty-message">
                <span class="material-icons">info</span>
                <p>No hay materiales seleccionados</p>
              </div>
              
              <div v-else class="selected-list">
                <div 
                  class="selected-item" 
                  v-for="(material, index) in pedido.materiales" 
                  :key="index"
                >
                  <div class="item-info">
                    <span class="item-name">{{ getMaterialName(material.id) }}</span>
                    <div class="item-details">
                      <span class="item-qty">{{ material.cantidad }} {{ getMaterialUnit(material.id) }}</span>
                      <span class="item-stock">
                        (Stock: {{ getMaterialStock(material.id) }})
                      </span>
                    </div>
                  </div>
                  
                  <div class="item-actions">
                    <button 
                      class="edit-btn"
                      @click="editMaterialQuantity(material)"
                      :title="`Editar cantidad de ${getMaterialName(material.id)}`"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button 
                      class="remove-btn"
                      @click="removeMaterial(index)"
                      :title="`Eliminar ${getMaterialName(material.id)}`"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notas adicionales -->
        <div class="form-section">
          <div class="form-group">
            <label>Notas Adicionales</label>
            <textarea v-model="pedido.notas" rows="3" placeholder="Agregue cualquier información adicional relevante..."></textarea>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn secondary" @click="close">Cancelar</button>
        <button class="btn primary" @click="save" :disabled="saving">
          {{ saving ? 'Guardando...' : (mode === 'create' ? 'Crear Orden' : 'Guardar Cambios') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script src="/src/components/scripts/WorkOrderModalScrip.js"></script>

<style src="/src/assets/Componentes_Style/WorkOrderModalStyle.css" scoped></style>