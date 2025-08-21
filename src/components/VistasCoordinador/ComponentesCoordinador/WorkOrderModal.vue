<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ mode === 'create' ? 'Nueva Orden de Trabajo' : 'Editar Orden #' + formData.codigo_pedido }}</h2>
        <button class="close-btn" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Loading indicator -->
        <div v-if="loadingCatalogs" class="loading-section">
          <div class="loading-spinner"></div>
          <p>Cargando información...</p>
        </div>

        <!-- ERROR SECTION -->
        <div v-if="loadingError" class="error-section">
          <h3>❌ Error de Carga</h3>
          <p>{{ loadingError }}</p>
          <button @click="retryLoad" class="btn primary">Reintentar</button>
        </div>

        <!-- FORM SECTION -->
        <div class="form-section" v-show="!loadingCatalogs && !loadingError">
          <h3 class="section-title">
            <span class="material-icons">assignment</span> Información General
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Código de Pedido *</label>
              <input 
                type="text" 
                v-model="formData.codigo_pedido" 
                :readonly="mode === 'edit'"
                required
                placeholder="Se generará automáticamente"
              >
            </div>
            
            <div class="form-group">
              <label>Tipo de Pedido *</label>
              <select v-model="formData.tipo_pedido_id" required>
                <option value="">Seleccionar tipo</option>
                <option v-for="tipo in tiposPedido" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre || tipo.name || 'Sin nombre' }}
                </option>
              </select>
              <div v-if="errors.tipo_pedido_id" class="error-message">{{ errors.tipo_pedido_id }}</div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Plano/Documento *</label>
              <select v-model="formData.plano_id" required>
                <option value="">Seleccionar plano</option>
                <option v-for="plano in planos" :key="plano.id" :value="plano.id">
                  {{ (plano.nombre || plano.name || 'Sin nombre') }} - {{ (plano.codigo || plano.code || 'Sin código') }}
                </option>
              </select>
              <div v-if="errors.plano_id" class="error-message">{{ errors.plano_id }}</div>
            </div>
            
            <div class="form-group">
              <label>Solicitante *</label>
              <select v-model="formData.solicitante_id" required>
                <option value="">Seleccionar solicitante</option>
                <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                  {{ (usuario.nombres || usuario.name || 'Sin nombre') }} {{ (usuario.apellidos || usuario.lastname || '') }}
                </option>
              </select>
              <div v-if="errors.solicitante_id" class="error-message">{{ errors.solicitante_id }}</div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Aprobador</label>
              <select v-model="formData.aprobador_id">
                <option value="">Sin asignar</option>
                <option v-for="usuario in usuariosAprobadores" :key="usuario.id" :value="usuario.id">
                  {{ (usuario.nombres || usuario.name || 'Sin nombre') }} {{ (usuario.apellidos || usuario.lastname || '') }}
                  <span v-if="usuario.puesto?.nombre || usuario.position?.name">
                    - {{ usuario.puesto?.nombre || usuario.position?.name }}
                  </span>
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Supervisor</label>
              <select v-model="formData.supervisor_id">
                <option value="">Sin asignar</option>
                <option v-for="usuario in usuariosSupervisores" :key="usuario.id" :value="usuario.id">
                  {{ (usuario.nombres || usuario.name || 'Sin nombre') }} {{ (usuario.apellidos || usuario.lastname || '') }}
                  <span v-if="usuario.puesto?.nombre || usuario.position?.name">
                    - {{ usuario.puesto?.nombre || usuario.position?.name }}
                  </span>
                </option>
              </select>
              <small class="field-help">Quien será el encargado del proyecto</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha Requerida *</label>
              <input 
                type="date" 
                v-model="formData.fecha_requerida"
                :min="minDate"
                required
              >
              <div v-if="errors.fecha_requerida" class="error-message">{{ errors.fecha_requerida }}</div>
            </div>
            
            <div class="form-group">
              <label>Fecha Estimada de Entrega</label>
              <input 
                type="date" 
                v-model="formData.fecha_estimada_entrega"
                :min="formData.fecha_requerida || minDate"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prioridad *</label>
              <select v-model="formData.prioridad" required>
                <option value="1">Alta (1)</option>
                <option value="2">Media-Alta (2)</option>
                <option value="3" selected>Media (3)</option>
                <option value="4">Media-Baja (4)</option>
                <option value="5">Baja (5)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Proyecto Asociado</label>
              <input 
                type="text" 
                v-model="formData.proyecto_asociado"
                placeholder="Nombre del proyecto (opcional)"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Costo Estimado</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                v-model="formData.costo_estimado"
                placeholder="0.00"
              >
              <small class="field-help">Costo interno estimado del proyecto</small>
            </div>
            
            <div class="form-group">
              <label>Precio Final *</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                v-model="formData.precio_final"
                placeholder="0.00"
                required
              >
              <div v-if="errors.precio_final" class="error-message">{{ errors.precio_final }}</div>
              <div v-if="priceValidationMessage" :class="'price-validation ' + priceValidationClass">
                {{ priceValidationMessage }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Notas</label>
              <textarea 
                v-model="formData.notas"
                rows="3"
                placeholder="Notas adicionales del trabajo a realizar..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn secondary" @click="close">Cancelar</button>
        <button 
          class="btn primary" 
          @click="save" 
          :disabled="loadingCatalogs || saving"
        >
          {{ saving ? 'Guardando...' : (mode === 'create' ? 'Crear Orden' : 'Actualizar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkOrderModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0]
    },
    isFormValid() {
      return this.formData.tipo_pedido_id && 
             this.formData.plano_id && 
             this.formData.solicitante_id && 
             this.formData.fecha_requerida && 
             this.formData.precio_final &&
             parseFloat(this.formData.precio_final) > 0
    },
    priceValidationMessage() {
      if (!this.formData.precio_final || !this.formData.costo_estimado) {
        return null
      }
      
      const precioFinal = parseFloat(this.formData.precio_final)
      const costoEstimado = parseFloat(this.formData.costo_estimado)
      
      if (precioFinal <= costoEstimado) {
        return 'El precio final debe ser mayor que el costo estimado'
      }
      
      const margen = ((precioFinal - costoEstimado) / costoEstimado * 100).toFixed(1)
      return `Margen de ganancia: ${margen}%`
    },
    priceValidationClass() {
      if (!this.priceValidationMessage) return ''
      return this.priceValidationMessage.includes('debe ser mayor') ? 'error' : 'success'
    }
  },
    mode: {
      type: String,
      default: 'create'
    },
    pedido: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // Form data
      formData: {
        codigo_pedido: '',
        tipo_pedido_id: '',
        plano_id: '',
        solicitante_id: '',
        aprobador_id: '',
        supervisor_id: '',
        descripcion: '',
        fecha_entrega: '',
        prioridad: 'media'
      },
      errors: {},
      
      // Data arrays
      tiposPedido: [],
      planos: [],
      usuarios: [], // Solicitantes (Puesto 5)
      usuariosAprobadores: [], // Puesto 1
      usuariosSupervisores: [], // Supervisores/Coordinadores (Puesto 2)
      estadosPedido: [],
      
      // Loading states
      loadingCatalogs: false,
      loadingError: null,
      saving: false
    }
  },
  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm()
          this.loadCatalogs()
        }
      },
      immediate: true
    }
  },
  methods: {
    initializeForm() {
      if (this.mode === 'edit' && this.pedido) {
        this.formData = {
          codigo_pedido: this.pedido.codigo_pedido || '',
          tipo_pedido_id: this.pedido.tipo_pedido_id || '',
          plano_id: this.pedido.plano_id || '',
          solicitante_id: this.pedido.solicitante_id || '',
          aprobador_id: this.pedido.aprobador_id || '',
          supervisor_id: this.pedido.supervisor_id || '',
          fecha_requerida: this.pedido.fecha_requerida || '',
          fecha_estimada_entrega: this.pedido.fecha_estimada_entrega || '',
          prioridad: this.pedido.prioridad || 3,
          proyecto_asociado: this.pedido.proyecto_asociado || '',
          costo_estimado: this.pedido.costo_estimado || '',
          precio_final: this.pedido.precio_final || '',
          notas: this.pedido.notas || ''
        }
      } else {
        this.formData = {
          codigo_pedido: '',
          tipo_pedido_id: '',
          plano_id: '',
          solicitante_id: '',
          aprobador_id: '',
          supervisor_id: '',
          fecha_requerida: '',
          fecha_estimada_entrega: '',
          prioridad: 3,
          proyecto_asociado: '',
          costo_estimado: '',
          precio_final: '',
          notas: ''
        }
      }
      this.errors = {}
      this.loadingError = null
    },
    
    async loadCatalogs() {
      this.loadingCatalogs = true
      this.loadingError = null
      
      try {
        // Reset arrays
        this.tiposPedido = []
        this.planos = []
        this.usuarios = []
        this.usuariosAprobadores = []
        this.usuariosSupervisores = []
        this.estadosPedido = []
        
        console.log('🔄 Cargando catálogos...')
        
        // Load all catalogs in parallel
        await Promise.all([
          this.loadSingleAPI('/api/Tipo_Pedido', 'tiposPedido', 'Tipos de Pedido'),
          this.loadSingleAPI('/api/Plano', 'planos', 'Planos'),
          this.loadSingleAPI('/api/Usuario/Puesto/5', 'usuarios', 'Solicitantes'),
          this.loadSingleAPI('/api/Usuario/Puesto/1', 'usuariosAprobadores', 'Aprobadores'),
          this.loadSingleAPI('/api/Usuario/Puesto/2', 'usuariosSupervisores', 'Supervisores/Coordinadores'),
          this.loadSingleAPI('/api/EstadoPedido', 'estadosPedido', 'Estados de Pedido')
        ])
        
        console.log('✅ Catálogos cargados:', {
          tiposPedido: this.tiposPedido.length,
          planos: this.planos.length,
          usuarios: this.usuarios.length,
          usuariosAprobadores: this.usuariosAprobadores.length,
          usuariosSupervisores: this.usuariosSupervisores.length,
          estadosPedido: this.estadosPedido.length
        })
        
      } catch (error) {
        console.error('Error en loadCatalogs:', error)
        this.loadingError = `Error de carga: ${error.message}`
      } finally {
        this.loadingCatalogs = false
      }
    },
    
    async loadSingleAPI(url, dataProperty, displayName) {
      try {
        console.log(`📡 Cargando ${displayName} desde ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
          }
        })
        
        console.log(`📊 Response ${displayName}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`📦 Data ${displayName}:`, data)
        
        // Verificar que sea un array
        if (Array.isArray(data)) {
          this[dataProperty] = data
          console.log(`✅ ${displayName} cargado: ${data.length} items`)
        } else if (data && typeof data === 'object') {
          // Si no es array pero tiene datos, intentar extraerlos
          const possibleArrays = Object.values(data).filter(v => Array.isArray(v))
          if (possibleArrays.length > 0) {
            this[dataProperty] = possibleArrays[0]
            console.log(`🔧 Usando array encontrado en objeto para ${displayName}:`, possibleArrays[0].length)
          } else {
            this[dataProperty] = []
            console.warn(`⚠️ ${displayName}: No se encontró array en la respuesta`)
          }
        } else {
          this[dataProperty] = []
          console.warn(`⚠️ ${displayName}: Respuesta no es un array ni objeto válido`)
        }
        
      } catch (error) {
        console.error(`❌ Error cargando ${displayName}:`, error)
        this[dataProperty] = []
        // No lanzar el error para que continúe con las otras APIs
      }
    },
    
    async retryLoad() {
      await this.loadCatalogs()
    },
    
    validateForm() {
      this.errors = {}
      
      if (!this.formData.tipo_pedido_id) {
        this.errors.tipo_pedido_id = 'El tipo de pedido es requerido'
      }
      
      if (!this.formData.plano_id) {
        this.errors.plano_id = 'El plano es requerido'
      }
      
      if (!this.formData.solicitante_id) {
        this.errors.solicitante_id = 'El solicitante es requerido'
      }

      if (!this.formData.fecha_requerida) {
        this.errors.fecha_requerida = 'La fecha requerida es obligatoria'
      } else {
        const fechaRequerida = new Date(this.formData.fecha_requerida)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        if (fechaRequerida < hoy) {
          this.errors.fecha_requerida = 'La fecha requerida no puede ser anterior a hoy'
        }
      }

      if (!this.formData.precio_final) {
        this.errors.precio_final = 'El precio final es obligatorio'
      } else {
        const precioFinal = parseFloat(this.formData.precio_final)
        if (precioFinal <= 0) {
          this.errors.precio_final = 'El precio final debe ser mayor a 0'
        }
        
        if (this.formData.costo_estimado) {
          const costoEstimado = parseFloat(this.formData.costo_estimado)
          if (precioFinal <= costoEstimado) {
            this.errors.precio_final = 'El precio final debe ser mayor que el costo estimado'
          }
        }
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    prepareOrderData() {
      // Generar código si no existe
      const codigoPedido = this.formData.codigo_pedido || this.generateOrderCode()
      
      const orderData = {
        codigo_pedido: codigoPedido,
        tipo_pedido_id: parseInt(this.formData.tipo_pedido_id),
        plano_id: parseInt(this.formData.plano_id),
        solicitante_id: parseInt(this.formData.solicitante_id),
        fecha_solicitud: new Date().toISOString(),
        fecha_requerida: this.formData.fecha_requerida,
        estado_id: 1, // 1 = Estado inicial (borrador o pendiente)
        prioridad: parseInt(this.formData.prioridad),
        precio_final: parseFloat(this.formData.precio_final)
      }
      
      // Campos opcionales - solo agregar si tienen valor
      if (this.formData.aprobador_id) {
        orderData.aprobador_id = parseInt(this.formData.aprobador_id)
      }
      
      if (this.formData.supervisor_id) {
        orderData.supervisor_id = parseInt(this.formData.supervisor_id)
      }
      
      if (this.formData.fecha_estimada_entrega) {
        orderData.fecha_estimada_entrega = this.formData.fecha_estimada_entrega
      }
      
      if (this.formData.proyecto_asociado) {
        orderData.proyecto_asociado = this.formData.proyecto_asociado
      }
      
      if (this.formData.costo_estimado) {
        orderData.costo_estimado = parseFloat(this.formData.costo_estimado)
      }
      
      if (this.formData.notas) {
        orderData.notas = this.formData.notas
      }
      
      return orderData
    },

    generateOrderCode() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const timestamp = now.getTime().toString().slice(-4)
      
      return `PED-${year}${month}${day}-${timestamp}`
    },
    
    async save() {
      if (!this.validateForm()) {
        return
      }
      
      this.saving = true
      
      try {
        const orderData = this.prepareOrderData()
        
        console.log('Enviando datos:', orderData) // Debug
        
        const url = this.mode === 'create' ? '/api/Pedido' : `/api/Pedido/${this.pedido.id}`
        const method = this.mode === 'create' ? 'POST' : 'PUT'
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(orderData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Error del servidor:', errorData) // Debug
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        this.$emit('saved', result)
        this.close()
        
      } catch (error) {
        console.error('Error guardando:', error)
        alert('Error al guardar la orden de trabajo: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || localStorage.getItem('token') || ''
    },
    
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Loading */
.loading-section {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Section */
.error-section {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.error-section h3 {
  margin-top: 0;
}

/* Form Styles */
.form-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input[readonly] {
  background-color: #f8f9fa;
  color: #6c757d;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.field-help {
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  margin-top: 5px;
  font-weight: 500;
}

/* Button Styles */
.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background: #545b62;
}

/* Price validation styles */
.price-validation {
  font-size: 0.8em;
  margin-top: 5px;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: 500;
}

.price-validation.success {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.price-validation.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-header {
    padding: 15px;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .modal-footer {
    padding: 15px;
    flex-direction: column;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
}
</style>