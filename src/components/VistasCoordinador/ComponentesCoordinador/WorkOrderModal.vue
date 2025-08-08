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
              <label>Proyecto Asociado</label>
              <input type="text" v-model="pedido.proyecto_asociado">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Requerida *</label>
              <input type="date" v-model="pedido.fecha_requerida" required>
            </div>
            
            <div class="form-group">
              <label>Fecha Estimada de Entrega</label>
              <input type="date" v-model="pedido.fecha_estimada_entrega">
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
        
        <!-- Sección de asignación de trabajadores -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">engineering</span> Asignación de Trabajadores
          </h3>
          
          <div class="loading-message" v-if="loadingUsuarios">
            Cargando usuarios...
          </div>
          
          <div class="workers-selection" v-else>
            <div class="workers-list">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchUsuarios" 
                  placeholder="Buscar trabajadores..."
                  class="search-input"
                >
              </div>
              
              <div class="worker-item" v-for="usuario in filteredUsuarios" :key="usuario.id">
                <label class="worker-checkbox">
                  <input 
                    type="checkbox"
                    v-model="pedido.trabajadores_asignados"
                    :value="usuario.id"
                  >
                  <span class="checkmark"></span>
                  <div class="worker-info">
                    <span class="worker-name">{{ usuario.nombres }} {{ usuario.apellidos }}</span>
                    <span class="worker-role">{{ usuario.puesto?.nombre || 'Sin puesto definido' }}</span>
                    <span class="worker-contact">{{ usuario.email }}</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="assigned-preview" v-if="pedido.trabajadores_asignados && pedido.trabajadores_asignados.length > 0">
              <h4>Trabajadores asignados:</h4>
              <div class="assigned-list">
                <span v-for="usuarioId in pedido.trabajadores_asignados" :key="usuarioId" class="assigned-badge">
                  {{ getUsuarioName(usuarioId) }}
                  <button @click="removeWorker(usuarioId)" class="remove-worker-btn">
                    <span class="material-icons">close</span>
                  </button>
                </span>
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

<script>
export default {
  props: {
    pedido: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        codigo_pedido: '',
        tipo_pedido_id: null,
        prioridad: 3,
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        proyecto_asociado: '',
        costo_estimado: null,
        precio_final: null,
        trabajadores_asignados: [],
        herramientas_asignadas: [],
        materiales: [],
        planos: [],
        notas: '',
        estado_id: 1
      })
    },
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'edit'].includes(value)
    }
  },
  
  data() {
    return {
      usuarios: [],
      herramientas: [],
      tiposPedido: [
        { id: 1, nombre: 'Fabricación' },
        { id: 2, nombre: 'Reparación' },
        { id: 3, nombre: 'Mantenimiento' },
        { id: 4, nombre: 'Modificación' }
      ],
      materialOptions: [],
      loadingMateriales: false,
      filterStock: 'all',
      
      // Estados de carga
      loadingUsuarios: false,
      loadingHerramientas: false,
      saving: false,
      
      // Búsqueda
      searchUsuarios: '',
      searchHerramientas: '',
      searchMateriales: '',
      
      // Archivos nuevos
      newFiles: []
    }
  },
  
  computed: {
    filteredUsuarios() {
      if (!this.searchUsuarios) return this.usuarios;
      const search = this.searchUsuarios.toLowerCase();
      return this.usuarios.filter(usuario => {
        const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase();
        const puestoNombre = usuario.puesto?.nombre?.toLowerCase() || '';
        const email = usuario.email?.toLowerCase() || '';
        
        return nombreCompleto.includes(search) || 
               puestoNombre.includes(search) ||
               email.includes(search);
      });
    },
    
    filteredHerramientas() {
      if (!this.searchHerramientas) return this.herramientas;
      const search = this.searchHerramientas.toLowerCase();
      return this.herramientas.filter(herramienta =>
        herramienta.nombre.toLowerCase().includes(search) ||
        herramienta.tipo.toLowerCase().includes(search)
      );
    },

    filteredAvailableMaterials() {
      let materials = this.materialOptions;
      
      // Aplicar filtro de búsqueda
      if (this.searchMateriales) {
        const search = this.searchMateriales.toLowerCase();
        materials = materials.filter(material => 
          material.nombre.toLowerCase().includes(search) ||
          (material.descripcion && material.descripcion.toLowerCase().includes(search))
        );
      }
      
      // Aplicar filtro de stock
      switch (this.filterStock) {
        case 'available':
          materials = materials.filter(m => m.stock > 0);
          break;
        case 'low':
          materials = materials.filter(m => m.stock > 0 && m.stock <= (m.stock_minimo || 5));
          break;
        // 'all' no necesita filtro adicional
      }
      
      return materials.sort((a, b) => {
        // Ordenar primero los seleccionados
        const aSelected = this.isMaterialSelected(a.id);
        const bSelected = this.isMaterialSelected(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        
        // Luego por stock (disponibles primero)
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        
        // Luego por stock bajo
        const aLowStock = a.stock <= (a.stock_minimo || 5);
        const bLowStock = b.stock <= (b.stock_minimo || 5);
        if (aLowStock && !bLowStock) return -1;
        if (!aLowStock && bLowStock) return 1;
        
        // Finalmente por nombre
        return a.nombre.localeCompare(b.nombre);
      });
    }
  },
  
  async mounted() {
    await this.loadUsuarios();
    await this.loadHerramientas();
    await this.loadMateriales();
  },
  
  methods: {
    // Carga de datos desde API
    async loadUsuarios() {
      this.loadingUsuarios = true;
      try {
        const response = await fetch('/api/usuarios');
        if (response.ok) {
          this.usuarios = await response.json();
        } else {
          console.error('Error al cargar usuarios:', response.statusText);
          // Datos de fallback
          this.usuarios = this.getFallbackUsuarios();
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = this.getFallbackUsuarios();
      } finally {
        this.loadingUsuarios = false;
      }
    },
    
    getFallbackUsuarios() {
      return [
        { 
          id: 1, 
          nombres: 'Juan Carlos', 
          apellidos: 'Pérez González', 
          activo: true,
          puesto: { nombre: 'Soldador Especializado' },
          telefono: '7890-1234',
          email: 'juan.perez@empresa.com'
        },
        { 
          id: 2, 
          nombres: 'María Elena', 
          apellidos: 'Gómez Rodríguez', 
          activo: true,
          puesto: { nombre: 'Mecánico Industrial' },
          telefono: '7890-5678',
          email: 'maria.gomez@empresa.com'
        }
      ];
    },
    
    async loadHerramientas() {
      this.loadingHerramientas = true;
      try {
        const response = await fetch('/api/herramientas');
        if (response.ok) {
          this.herramientas = await response.json();
        } else {
          console.error('Error al cargar herramientas:', response.statusText);
          this.herramientas = [
            { id: 1, nombre: 'Máquina CNC', tipo: 'Equipo', estado: 'Operativo', disponible: true },
            { id: 2, nombre: 'Equipo Soldadura MIG', tipo: 'Soldadura', estado: 'Operativo', disponible: true }
          ];
        }
      } catch (error) {
        console.error('Error al cargar herramientas:', error);
        this.herramientas = [
          { id: 1, nombre: 'Máquina CNC', tipo: 'Equipo', estado: 'Operativo', disponible: true }
        ];
      } finally {
        this.loadingHerramientas = false;
      }
    },
    
    async loadMateriales() {
      this.loadingMateriales = true;
      try {
        const response = await fetch('/api/materiales');
        if (response.ok) {
          const data = await response.json();
          this.materialOptions = data.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion,
            stock: item.cantidad_disponible || item.stock,
            stock_minimo: item.stock_minimo || 5,
            unidad: item.unidad_medida || 'unidades'
          }));
        } else {
          console.error('Error al cargar materiales:', response.statusText);
          this.materialOptions = this.getFallbackMateriales();
        }
      } catch (error) {
        console.error('Error al cargar materiales:', error);
        this.materialOptions = this.getFallbackMateriales();
      } finally {
        this.loadingMateriales = false;
      }
    },
    
    getFallbackMateriales() {
      return [
        { 
          id: 1, 
          nombre: 'Acero inoxidable 304', 
          descripcion: 'Plancha de acero inoxidable grado 304 de 1/4" de espesor',
          stock: 25, 
          stock_minimo: 10,
          unidad: 'planchas'
        },
        { 
          id: 2, 
          nombre: 'Tubo cuadrado 2x2', 
          descripcion: 'Tubo cuadrado de acero al carbono 2"x2" calibre 14',
          stock: 48, 
          stock_minimo: 20,
          unidad: 'metros'
        },
        { 
          id: 3, 
          nombre: 'Pintura epóxica negra', 
          descripcion: 'Pintura industrial epóxica color negro, resistente a químicos',
          stock: 0, 
          stock_minimo: 5,
          unidad: 'galones'
        }
      ];
    },
    
    // Métodos de validación y guardado
    close() {
      this.$emit('close');
    },
    
    async save() {
      if (this.validateForm()) {
        this.saving = true;
        try {
          if (this.newFiles.length > 0) {
            await this.processNewFiles();
          }
          
          this.$emit('save', this.pedido);
        } catch (error) {
          console.error('Error al guardar:', error);
          this.showError('Error al guardar la orden de trabajo');
        } finally {
          this.saving = false;
        }
      }
    },
    
    validateForm() {
      const errors = [];
      
      if (!this.pedido.codigo_pedido.trim()) errors.push('Ingrese un código de pedido');
      if (!this.pedido.tipo_pedido_id) errors.push('Seleccione un tipo de pedido');
      if (!this.pedido.fecha_requerida) errors.push('Seleccione fecha requerida');
      if (!this.pedido.precio_final || this.pedido.precio_final <= 0) {
        errors.push('Ingrese un precio final válido');
      }
      
      if (this.pedido.costo_estimado && this.pedido.precio_final <= this.pedido.costo_estimado) {
        errors.push('El precio final debe ser mayor que el costo estimado');
      }
      
      if (this.pedido.fecha_estimada_entrega && this.pedido.fecha_requerida) {
        if (new Date(this.pedido.fecha_estimada_entrega) < new Date(this.pedido.fecha_requerida)) {
          errors.push('La fecha estimada de entrega no puede ser anterior a la fecha requerida');
        }
      }
      
      if (!this.pedido.trabajadores_asignados || this.pedido.trabajadores_asignados.length === 0) {
        errors.push('Asigne al menos un trabajador');
      }
      
      // Validación de materiales
      this.pedido.materiales.forEach((mat, index) => {
        const material = this.materialOptions.find(m => m.id === mat.id);
        if (!material) {
          errors.push(`Material #${index + 1}: Material no encontrado`);
        } else if (mat.cantidad <= 0) {
          errors.push(`Material #${index + 1}: Cantidad debe ser mayor a 0`);
        } else if (mat.cantidad > material.stock) {
          errors.push(`Material #${index + 1}: Cantidad excede el stock disponible (${material.stock} ${material.unidad})`);
        }
      });
      
      if (errors.length > 0) {
        this.showError('Errores de validación:\n' + errors.join('\n'));
        return false;
      }
      return true;
    },
    
    showError(message) {
      if (this.$toast) {
        this.$toast.error(message);
      } else {
        alert(message);
      }
    },
    
    // Métodos para archivos PDF
    handleDrop(e) {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    },
    
    handleFileChange(e) {
      const files = e.target.files;
      this.handleFiles(files);
    },
    
    handleFiles(files) {
      const validFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024
      );
      
      if (validFiles.length !== files.length) {
        this.showError('Algunos archivos no son PDF o exceden el tamaño máximo de 10MB');
      }
      
      this.newFiles = [...this.newFiles, ...validFiles];
      this.previewNewFiles();
    },
    
    previewNewFiles() {
      this.newFiles.forEach(file => {
        if (!this.pedido.planos) {
          this.$set(this.pedido, 'planos', []);
        }
        
        this.pedido.planos.push({
          nombre_archivo: file.name,
          tamaño: file.size,
          fecha_subida: new Date().toISOString(),
          file: file
        });
      });
      
      this.newFiles = [];
    },
    
    removeBlueprint(index) {
      this.pedido.planos.splice(index, 1);
    },
    
    async processNewFiles() {
      // Implementación de subida de archivos
      const uploadPromises = this.pedido.planos
        .filter(plano => plano.file)
        .map(async (plano) => {
          const formData = new FormData();
          formData.append('file', plano.file);
          formData.append('nombre', plano.nombre_archivo);
          
          try {
            const response = await fetch('/api/planos/upload', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const result = await response.json();
              plano.id = result.id;
              plano.url = result.url;
              delete plano.file;
            }
          } catch (error) {
            console.error('Error subiendo archivo:', error);
          }
        });
      
      await Promise.all(uploadPromises);
    },
    
    // Métodos de utilidad
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    
    getUsuarioName(usuarioId) {
      const usuario = this.usuarios.find(u => u.id === usuarioId);
      return usuario ? `${usuario.nombres} ${usuario.apellidos}` : '';
    },
    
    removeWorker(usuarioId) {
      this.pedido.trabajadores_asignados = this.pedido.trabajadores_asignados.filter(id => id !== usuarioId);
    },
    
    getHerramientaIcon(tipo) {
      const iconMap = {
        'Equipo': 'precision_manufacturing',
        'Soldadura': 'handyman',
        'Horno': 'oven',
        'Herramienta': 'build',
        'default': 'handyman'
      };
      return iconMap[tipo] || iconMap.default;
    },
    
    // Métodos para materiales (mejorados)
    isMaterialSelected(materialId) {
      return this.pedido.materiales.some(m => m.id === materialId);
    },
    
    getAddedQuantity(materialId) {
      const material = this.pedido.materiales.find(m => m.id === materialId);
      return material ? material.cantidad : 0;
    },
    
    incrementMaterial(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty < material.stock) {
        this.updateMaterial(material, currentQty + 1);
      }
    },
    
    decrementMaterial(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty > 0) {
        this.updateMaterial(material, currentQty - 1);
      }
    },
    
    updateMaterialQuantity(material, event) {
      let newQty = parseInt(event.target.value) || 0;
      newQty = Math.max(0, Math.min(newQty, material.stock));
      this.updateMaterial(material, newQty);
    },
    
    updateMaterial(material, quantity) {
      const index = this.pedido.materiales.findIndex(m => m.id === material.id);
      
      if (index >= 0) {
        if (quantity > 0) {
          this.pedido.materiales[index].cantidad = quantity;
        } else {
          this.pedido.materiales.splice(index, 1);
        }
      } else if (quantity > 0) {
        this.pedido.materiales.push({
          id: material.id,
          cantidad: quantity
        });
      }
    },
    
    toggleMaterial(material) {
      if (this.isMaterialSelected(material.id)) {
        this.removeMaterialFromList(material.id);
      } else {
        this.addMaterialToList(material);
      }
    },
    
    addMaterialToList(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty <= 0) {
        this.updateMaterial(material, 1);
      }
    },
    
    removeMaterialFromList(materialId) {
      const index = this.pedido.materiales.findIndex(m => m.id === materialId);
      if (index >= 0) {
        this.pedido.materiales.splice(index, 1);
      }
    },
    
    editMaterialQuantity(material) {
      const maxQty = this.getMaterialStock(material.id);
      this.$prompt({
        title: 'Editar cantidad',
        message: `Ingrese la nueva cantidad para ${this.getMaterialName(material.id)} (máx: ${maxQty})`,
        inputType: 'number',
        inputValue: material.cantidad,
        inputAttributes: {
          min: 1,
          max: maxQty
        },
        confirmText: 'Guardar',
        cancelText: 'Cancelar'
      }).then(newQty => {
        newQty = parseInt(newQty);
        if (newQty > 0 && newQty <= maxQty) {
          this.updateMaterial(material, newQty);
        } else {
          this.showError(`La cantidad debe estar entre 1 y ${maxQty}`);
        }
      }).catch(() => {});
    },
    
    removeMaterial(index) {
      this.pedido.materiales.splice(index, 1);
    },
    
    getMaterialName(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.nombre : 'Material desconocido';
    },
    
    getMaterialStock(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.stock : 0;
    },
    
    getMaterialUnit(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.unidad : 'unidades';
    },
    
    truncateDescription(text, maxLength = 60) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    }
  }
}
</script>

<style scoped>
/* Estilos base del modal */
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
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e5e9;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 24px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #495057;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 32px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 0.2rem rgba(66, 185, 131, 0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Estilos para carga */
.loading-message {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

/* Estilos para búsqueda */
.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
  background-color: white;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

/* Estilos para planos */
.blueprints-section {
  margin-top: 1rem;
}

.file-upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.file-upload-area:hover {
  border-color: #42b983;
  background-color: #f0f8f5;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.large-icon {
  font-size: 3rem;
  color: #42b983;
  margin-bottom: 0.5rem;
}

.small-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.uploaded-files {
  margin-top: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
}

.file-list {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-name {
  font-weight: 500;
  color: #495057;
}

.file-meta {
  font-size: 0.8rem;
  color: #6c757d;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Estilos para trabajadores */
.workers-selection {
  display: flex;
  gap: 24px;
}

.workers-list {
  flex: 2;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  background-color: #fafafa;
}

.worker-item {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: white;
  transition: background-color 0.2s;
}

.worker-item:hover {
  background-color: #f8f9fa;
}

.worker-item:last-child {
  margin-bottom: 0;
}

.worker-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s;
}

.worker-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.worker-checkbox input:checked ~ .checkmark {
  background-color: #42b983;
  border-color: #42b983;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.worker-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.worker-info {
  display: flex;
  flex-direction: column;
}

.worker-name {
  font-weight: 500;
  color: #495057;
}

.worker-role {
  font-size: 0.85em;
  color: #6c757d;
  margin-top: 2px;
}

.worker-contact {
  font-size: 0.8em;
  color: #6c757d;
  margin-top: 2px;
}

.assigned-preview {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
  max-height: 400px;
  overflow-y: auto;
}

.assigned-preview h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #495057;
}

.assigned-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assigned-badge {
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85em;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.remove-worker-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.8em;
  transition: background-color 0.2s;
}

.remove-worker-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Estilos para herramientas */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.resource-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
}

.resource-item:hover {
  border-color: #42b983;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.resource-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  gap: 10px;
}

.resource-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #495057;
}

/* Estilos para la sección de materiales */
.materials-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e9ecef;
}

.filter-btn.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

/* Materiales disponibles */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.material-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.material-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.material-card.selected {
  border-color: #42b983;
  background-color: #f0f8f5;
}

.material-card.out-of-stock {
  opacity: 0.7;
  background-color: #f9f9f9;
}

.material-card.low-stock {
  border-left: 4px solid #ffc107;
}

.material-info {
  margin-bottom: 16px;
}

.material-info h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.05em;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stock-info .material-icons {
  font-size: 1.1em;
}

.min-stock {
  color: #666;
  font-size: 0.9em;
}

.material-description {
  font-size: 0.85em;
  color: #666;
  line-height: 1.4;
}

.material-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0 5px;
}

.qty-input.error {
  border-color: #dc3545;
  color: #dc3545;
}

.add-material-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.add-material-btn:hover:not(:disabled) {
  background-color: #369870;
  transform: translateY(-1px);
}

.add-material-btn.added {
  background-color: #dc3545;
}

.add-material-btn.added:hover {
  background-color: #c82333;
}

.add-material-btn.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.out-of-stock-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 12px;
}

/* Lista de materiales seleccionados */
.selected-materials {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selected-header h4 {
  margin: 0;
  color: #333;
}

.total-items {
  font-size: 0.9em;
  color: #666;
  background-color: #e9ecef;
  padding: 4px 10px;
  border-radius: 12px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  text-align: center;
}

.empty-message .material-icons {
  font-size: 2em;
  margin-bottom: 8px;
  color: #6c757d;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 16px;
  transition: all 0.2s;
}

.selected-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-details {
  display: flex;
  gap: 8px;
  font-size: 0.85em;
  color: #666;
}

.item-stock {
  color: #6c757d;
}

.item-actions {
  display: flex;
  gap: 6px;
}

.edit-btn, .remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.edit-btn:hover {
  background-color: #bbdefb;
}

.remove-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.remove-btn:hover {
  background-color: #ffcdd2;
}

/* Pie del modal */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background-color: #42b983;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background-color: #369870;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .workers-selection {
    flex-direction: column;
    gap: 16px;
  }
  
  .workers-list,
  .assigned-preview {
    max-height: 250px;
  }
  
  .materials-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: space-between;
  }
  
  .filter-btn {
    flex: 1;
    text-align: center;
  }
  
  .materials-grid {
    grid-template-columns: 1fr;
  }
  
  .material-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .quantity-controls {
    width: 100%;
    justify-content: center;
  }
  
  .add-material-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    margin: 1vh;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
  
  .file-upload-area {
    padding: 1.5rem 1rem;
  }
  
  .large-icon {
    font-size: 2rem;
  }
}
</style>