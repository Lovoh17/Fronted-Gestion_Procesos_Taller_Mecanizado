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
                    :disabled="!usuario.activo"
                  >
                  <span class="checkmark"></span>
                  <div class="worker-info">
                    <span class="worker-name">{{ usuario.nombres }} {{ usuario.apellidos }}</span>
                    <span class="worker-role">{{ usuario.puesto?.nombre || 'Sin puesto definido' }}</span>
                    <span class="worker-contact">{{ usuario.email }}</span>
                    <span v-if="!usuario.activo" class="worker-status unavailable">
                      No activo
                    </span>
                    <span v-else class="worker-status available">
                      Disponible
                    </span>
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
                <span class="resource-details">
                  ({{ herramienta.estado }})
                  <span v-if="!herramienta.disponible" class="unavailable-text">No disponible</span>
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Sección de materiales -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">inventory</span> Materiales Requeridos
          </h3>
          
          <div class="materials-list">
            <div class="material-item" v-for="(material, index) in pedido.materiales" :key="index">
              <div class="material-row">
                <select v-model="material.id" class="material-select">
                  <option value="">Seleccionar material</option>
                  <option v-for="mat in materialOptions" 
                          :key="mat.id" 
                          :value="mat.id"
                          :disabled="isMaterialSelected(mat.id, index)">
                    {{ mat.nombre }} ({{ mat.stock }} {{ mat.unidad }} disponibles)
                  </option>
                </select>
                
                <input 
                  type="number" 
                  v-model="material.cantidad" 
                  min="1" 
                  :max="getMaxQuantity(material.id)"
                  placeholder="Cantidad"
                  class="quantity-input"
                >
                
                <span class="material-unit">
                  {{ getMaterialUnit(material.id) }}
                </span>
                
                <button class="remove-btn" @click="removeMaterial(index)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
              
              <div v-if="materialError(material)" class="error-message">
                {{ materialError(material) }}
              </div>
            </div>
            
            <button class="add-btn" @click="addMaterial">
              <span class="material-icons">add</span> Agregar Material
            </button>
          </div>
        </div>
        
        <!-- Notas adicionales -->
        <div class="form-section">
          <div class="form-group">
            <label>Notas Adicionales</label>
            <textarea v-model="pedido.notas" rows="3"></textarea>
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
        estado_id: 1 // Estado inicial
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
      materialOptions: [
        { id: 1, nombre: 'Acero inoxidable', stock: 150, unidad: 'kg' },
        { id: 2, nombre: 'Tornillos M8', stock: 500, unidad: 'unidades' },
        { id: 3, nombre: 'Pintura industrial', stock: 25, unidad: 'litros' },
        { id: 4, nombre: 'Soldadura MIG', stock: 10, unidad: 'kg' }
      ],
      
      // Estados de carga
      loadingUsuarios: false,
      loadingHerramientas: false,
      saving: false,
      
      // Búsqueda
      searchUsuarios: '',
      searchHerramientas: '',
      
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
    }
  },
  
  async mounted() {
    // Probar diferentes endpoints hasta encontrar el correcto
    await this.loadUsuarios();
    await this.loadHerramientas();
  },
  
  methods: {
    // Carga de datos desde API
    async loadUsuarios() {
      this.loadingUsuarios = true;
      
      // Lista de endpoints posibles a probar
      const possibleEndpoints = [
        '/Usuario/Puesto/3',
        '/api/Usuario/Puesto/3', 
        '/api/usuarios/puesto/3',
        '/usuarios/puesto/3',
        '/api/empleados',
        '/empleados'
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Probando endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint);
          console.log(`${endpoint} - Status:`, response.status);
          
          if (response.ok) {
            // Verificar que realmente sea JSON antes de parsearlo
            const contentType = response.headers.get('content-type');
            console.log(`${endpoint} - Content-Type:`, contentType);
            
            if (contentType && contentType.includes('application/json')) {
              this.usuarios = await response.json();
              console.log(`✅ Empleados cargados exitosamente desde ${endpoint}:`, this.usuarios);
              this.loadingUsuarios = false;
              return; // Salir del bucle si fue exitoso
            } else {
              console.warn(`${endpoint} - La respuesta no es JSON`);
              const textResponse = await response.text();
              console.log(`${endpoint} - Contenido:`, textResponse.substring(0, 100) + '...');
            }
          } else {
            console.log(`${endpoint} - Error HTTP:`, response.status, response.statusText);
          }
        } catch (error) {
          console.log(`${endpoint} - Error de conexión:`, error.message);
        }
      }
      
      // Si llegamos aquí, ningún endpoint funcionó
      console.warn('🚨 Ningún endpoint de usuarios funcionó. Usando datos de fallback');
      
      // Mostrar notificación al usuario si existe el sistema de toast
      if (this.$toast) {
        this.$toast.warning('No se pudieron cargar los empleados desde el servidor. Usando datos de prueba.');
      } else if (window.alert) {
        console.warn('⚠️ API de empleados no disponible. Usando datos de prueba.');
      }
      
      // Datos de fallback simulando empleados
      this.usuarios = [
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
        },
        { 
          id: 3, 
          nombres: 'Carlos Alberto', 
          apellidos: 'Ruiz Martínez', 
          activo: false,
          puesto: { nombre: 'Pintor Industrial' },
          telefono: '7890-9012',
          email: 'carlos.ruiz@empresa.com'
        },
        { 
          id: 4, 
          nombres: 'Ana Patricia', 
          apellidos: 'López Hernández', 
          activo: true,
          puesto: { nombre: 'Montador de Estructuras' },
          telefono: '7890-3456',
          email: 'ana.lopez@empresa.com'
        },
        { 
          id: 5, 
          nombres: 'Roberto Miguel', 
          apellidos: 'Vásquez Torres', 
          activo: true,
          puesto: { nombre: 'Operador CNC' },
          telefono: '7890-7890',
          email: 'roberto.vasquez@empresa.com'
        }
      ];
      
      this.loadingUsuarios = false;
    },
    
    async loadHerramientas() {
      this.loadingHerramientas = true;
      try {
        const response = await fetch('/api/Herramienta');
        if (response.ok) {
          this.herramientas = await response.json();
        } else {
          console.error('Error al cargar herramientas:', response.statusText);
          // Datos de fallback
          this.herramientas = [
            { id: 1, nombre: 'Máquina CNC', tipo: 'Equipo', estado: 'Operativo', disponible: true },
            { id: 2, nombre: 'Equipo Soldadura MIG', tipo: 'Soldadura', estado: 'Operativo', disponible: true },
            { id: 3, nombre: 'Horno Industrial', tipo: 'Horno', estado: 'Mantenimiento', disponible: false },
            { id: 4, nombre: 'Taladro Industrial', tipo: 'Herramienta', estado: 'Operativo', disponible: true }
          ];
        }
      } catch (error) {
        console.error('Error al cargar herramientas:', error);
        // Usar datos de fallback
        this.herramientas = [
          { id: 1, nombre: 'Máquina CNC', tipo: 'Equipo', estado: 'Operativo', disponible: true },
          { id: 2, nombre: 'Equipo Soldadura', tipo: 'Soldadura', estado: 'Operativo', disponible: true }
        ];
      } finally {
        this.loadingHerramientas = false;
      }
    },
    
    // Métodos de validación y guardado
    close() {
      this.$emit('close');
    },
    
    async save() {
      if (this.validateForm()) {
        this.saving = true;
        try {
          // Procesar archivos nuevos si los hay
          if (this.newFiles.length > 0) {
            await this.processNewFiles();
          }
          
          // Emitir evento de guardado
          this.$emit('save', this.pedido);
        } catch (error) {
          console.error('Error al guardar:', error);
          alert('Error al guardar la orden de trabajo');
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
        if (!mat.id) {
          errors.push(`Material #${index + 1}: Seleccione un material`);
        } else if (mat.cantidad <= 0) {
          errors.push(`Material #${index + 1}: Cantidad debe ser mayor a 0`);
        } else {
          const material = this.materialOptions.find(m => m.id === mat.id);
          if (material && mat.cantidad > material.stock) {
            errors.push(`Material #${index + 1}: Cantidad excede el stock disponible (${material.stock} ${material.unidad})`);
          }
        }
      });
      
      if (errors.length > 0) {
        alert('Errores de validación:\n' + errors.join('\n'));
        return false;
      }
      return true;
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
        alert('Algunos archivos no son PDF o exceden el tamaño máximo de 10MB');
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
          file: file // Mantener referencia para subir
        });
      });
      
      this.newFiles = [];
    },
    
    removeBlueprint(index) {
      this.pedido.planos.splice(index, 1);
    },
    
    async processNewFiles() {
      // Aquí implementarías la subida real de archivos
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
              delete plano.file; // Remover referencia al archivo
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
    
    // Métodos para materiales
    addMaterial() {
      this.pedido.materiales.push({ id: '', cantidad: 1 });
    },
    
    removeMaterial(index) {
      this.pedido.materiales.splice(index, 1);
    },
    
    isMaterialSelected(materialId, currentIndex) {
      return this.pedido.materiales.some((mat, index) => 
        mat.id === materialId && index !== currentIndex
      );
    },
    
    getMaxQuantity(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.stock : 0;
    },
    
    getMaterialUnit(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.unidad : '';
    },
    
    materialError(material) {
      if (material.id) {
        const selectedMat = this.materialOptions.find(m => m.id === material.id);
        if (selectedMat && material.cantidad > selectedMat.stock) {
          return `Cantidad excede el stock disponible (${selectedMat.stock} ${selectedMat.unidad})`;
        }
      }
      return null;
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
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
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

.worker-status {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 12px;
  margin-top: 4px;
  display: inline-block;
  width: fit-content;
}

.worker-contact {
  font-size: 0.8em;
  color: #6c757d;
  margin-top: 2px;
}

.worker-status.available {
  background-color: #d4edda;
  color: #155724;
}

.worker-status.unavailable {
  background-color: #ffebee;
  color: #c62828;
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
  border: 1px solid #e9ecef;
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

.resource-details {
  font-size: 0.8em;
  color: #6c757d;
  margin-top: 4px;
  display: block;
}

.unavailable-text {
  color: #dc3545;
  font-weight: 500;
}

/* Estilos para materiales */
.materials-list {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.material-item {
  margin-bottom: 16px;
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.material-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.material-select {
  flex: 2;
  min-width: 0;
}

.quantity-input {
  width: 100px;
}

.material-unit {
  width: 80px;
  font-size: 0.9em;
  color: #6c757d;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  margin-left: 12px;
  font-weight: 500;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 2px dashed #42b983;
  color: #42b983;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 6px;
  font-weight: 500;
  width: 100%;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background-color: rgba(66, 185, 131, 0.1);
  border-style: solid;
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
  
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .material-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .material-select {
    width: 100%;
    order: 1;
  }
  
  .quantity-input {
    width: 80px;
    order: 2;
  }
  
  .material-unit {
    width: 60px;
    order: 3;
  }
  
  .remove-btn {
    order: 4;
  }
  
  .workers-selection {
    flex-direction: column;
    gap: 16px;
  }
  
  .workers-list,
  .assigned-preview {
    max-height: 250px;
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