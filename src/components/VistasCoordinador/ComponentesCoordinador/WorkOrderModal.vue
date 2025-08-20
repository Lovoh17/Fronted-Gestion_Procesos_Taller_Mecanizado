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
                  {{ tipo.nombre }}
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
                  {{ plano.nombre }} - {{ plano.codigo }}
                </option>
              </select>
              <div v-if="errors.plano_id" class="error-message">{{ errors.plano_id }}</div>
            </div>
            
            <div class="form-group">
              <label>Solicitante *</label>
              <select v-model="formData.solicitante_id" required>
                <option value="">Seleccionar solicitante</option>
                <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nombres }} {{ usuario.apellidos }} - {{ usuario.email }}
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
                  {{ usuario.nombres }} {{ usuario.apellidos }} - {{ usuario.puesto?.nombre }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Supervisor</label>
              <select v-model="formData.supervisor_id">
                <option value="">Sin asignar</option>
                <option v-for="usuario in usuariosSupervisores" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nombres }} {{ usuario.apellidos }} - {{ usuario.puesto?.nombre }}
                </option>
              </select>
              <small class="field-help">Quien será el encargado del proyecto</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Requerida *</label>
              <input type="date" v-model="formData.fecha_requerida" required :min="minDate">
              <div v-if="errors.fecha_requerida" class="error-message">{{ errors.fecha_requerida }}</div>
            </div>
            
            <div class="form-group">
              <label>Fecha Estimada de Entrega</label>
              <input type="date" v-model="formData.fecha_estimada_entrega" :min="formData.fecha_requerida">
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
                placeholder="Nombre del proyecto relacionado"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Costo Estimado</label>
              <div class="input-with-currency">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  v-model="formData.costo_estimado"
                  placeholder="0.00"
                  min="0"
                  @input="validatePrices"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>Precio Final *</label>
              <div class="input-with-currency">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  v-model="formData.precio_final"
                  placeholder="0.00"
                  required
                  min="0.01"
                  @input="validatePrices"
                >
              </div>
              <div v-if="errors.precio_final" class="error-message">{{ errors.precio_final }}</div>
              <div v-if="priceValidationMessage" class="validation-message" :class="priceValidationClass">
                {{ priceValidationMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Alertas de Validación -->
        <div class="alerts-section" v-if="validationAlerts.length > 0">
          <div 
            v-for="alert in validationAlerts" 
            :key="alert.id" 
            class="alert-card"
            :class="alert.type"
          >
            <div class="alert-icon">
              <span class="material-icons">{{ getAlertIcon(alert.type) }}</span>
            </div>
            <div class="alert-content">
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.message }}</p>
            </div>
            <button class="alert-dismiss" @click="dismissAlert(alert.id)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
        
        <!-- Sección de archivos/planos -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">architecture</span> Archivos Adjuntos
          </h3>
          
          <div class="file-upload-section">
            <div class="file-upload-area" @dragover.prevent @drop.prevent="handleFileDrop">
              <input type="file" id="file-upload" ref="fileInput" 
                     accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png" multiple @change="handleFileChange" hidden>
              <label for="file-upload" class="upload-label">
                <span class="material-icons large-icon">cloud_upload</span>
                <p>Arrastra archivos aquí o haz clic para seleccionarlos</p>
                <p class="small-text">Formatos soportados: PDF, DWG, DXF, JPG, PNG (máx. 10MB c/u)</p>
              </label>
            </div>
            
            <div class="uploaded-files" v-if="uploadedFiles.length > 0">
              <div class="file-list-header">
                <span>Archivos adjuntos ({{ uploadedFiles.length }})</span>
              </div>
              
              <div class="file-list">
                <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                  <div class="file-info">
                    <span class="material-icons">{{ getFileIcon(file.type) }}</span>
                    <div>
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-meta">{{ formatFileSize(file.size) }}</div>
                    </div>
                  </div>
                  <button class="icon-btn small" @click="removeFile(index)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notas adicionales -->
        <div class="form-section">
          <div class="form-group">
            <label>Notas Adicionales</label>
            <textarea 
              v-model="formData.notas" 
              rows="4" 
              placeholder="Agregue cualquier información adicional relevante para la orden de trabajo..."
              maxlength="1000"
            ></textarea>
            <div class="character-count">{{ (formData.notas || '').length }}/1000 caracteres</div>
          </div>
        </div>

        <!-- Resumen de la orden -->
        <div class="form-section" v-if="isFormValid">
          <h3 class="section-title">
            <span class="material-icons">summarize</span> Resumen de la Orden
          </h3>
          
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">Código:</span>
              <span class="summary-value">{{ formData.codigo_pedido || 'Se generará automáticamente' }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tipo:</span>
              <span class="summary-value">{{ getTipoPedidoName(formData.tipo_pedido_id) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Plano:</span>
              <span class="summary-value">{{ getPlanoName(formData.plano_id) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Solicitante:</span>
              <span class="summary-value">{{ getUsuarioName(formData.solicitante_id) }}</span>
            </div>
            <div class="summary-row" v-if="formData.supervisor_id">
              <span class="summary-label">Supervisor:</span>
              <span class="summary-value">{{ getUsuarioName(formData.supervisor_id) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Fecha requerida:</span>
              <span class="summary-value">{{ formatDate(formData.fecha_requerida) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Prioridad:</span>
              <span class="summary-value priority" :class="`priority-${formData.prioridad}`">
                {{ getPriorityName(formData.prioridad) }}
              </span>
            </div>
            <div class="summary-row" v-if="formData.precio_final">
              <span class="summary-label">Precio final:</span>
              <span class="summary-value price">${{ parseFloat(formData.precio_final).toLocaleString('es-GT', {minimumFractionDigits: 2}) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn secondary" @click="close">Cancelar</button>
        <button class="btn secondary" @click="saveDraft" :disabled="saving">
          <span class="material-icons">save</span>
          Guardar Borrador
        </button>
        <button 
          class="btn primary" 
          @click="sendForApproval" 
          :disabled="saving || !isFormValid"
        >
          {{ saving ? 'Enviando...' : 'Enviar para Aprobación' }}
        </button>
        <button 
          v-if="canCreateImmediately" 
          class="btn success" 
          @click="createImmediately" 
          :disabled="saving || !isFormValid"
        >
          {{ saving ? 'Creando...' : 'Crear Inmediatamente' }}
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
    mode: {
      type: String,
      default: 'create' // 'create' or 'edit'
    },
    pedido: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      saving: false,
      formData: {
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
      },
      errors: {},
      validationAlerts: [],
      uploadedFiles: [],
      
      // Datos de catálogos
      tiposPedido: [],
      planos: [],
      usuarios: [],
      usuariosAprobadores: [],
      usuariosSupervisores: [],
      
      // Estados de carga
      loadingCatalogs: false
    }
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
    canCreateImmediately() {
      // Simular permisos del usuario para crear inmediatamente
      return true // En producción esto vendría del store/auth
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
  watch: {
    show(newVal) {
      if (newVal) {
        this.initializeForm()
        this.loadCatalogs()
      }
    }
  },
  methods: {
    initializeForm() {
      if (this.mode === 'edit' && this.pedido) {
        this.formData = { ...this.pedido }
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
      this.validationAlerts = []
    },
    
    async loadCatalogs() {
      this.loadingCatalogs = true
      try {
        // Cargar todos los catálogos necesarios
        const [tiposResponse, planosResponse, usuariosResponse] = await Promise.all([
          fetch('/api/TipoPedido'),
          fetch('/api/Plano'),
          fetch('/api/Usuario')
        ])
        
        this.tiposPedido = await tiposResponse.json()
        this.planos = await planosResponse.json()
        this.usuarios = await usuariosResponse.json()
        
        // Filtrar usuarios por rol para aprobadores y supervisores
        this.usuariosAprobadores = this.usuarios.filter(u => 
          u.roles?.includes('aprobador') || u.puesto?.permisos?.includes('aprobar_pedidos')
        )
        this.usuariosSupervisores = this.usuarios.filter(u => 
          u.roles?.includes('supervisor') || u.puesto?.permisos?.includes('supervisar_proyectos')
        )
        
      } catch (error) {
        console.error('Error cargando catálogos:', error)
        this.showError('Error al cargar los datos necesarios')
      } finally {
        this.loadingCatalogs = false
      }
    },
    
    validateForm() {
      this.errors = {}
      this.validationAlerts = []
      
      // Validar campos obligatorios
      if (!this.formData.tipo_pedido_id) {
        this.errors.tipo_pedido_id = 'El tipo de pedido es obligatorio'
      }
      
      if (!this.formData.plano_id) {
        this.errors.plano_id = 'Debe seleccionar un plano'
      }
      
      if (!this.formData.solicitante_id) {
        this.errors.solicitante_id = 'Debe seleccionar un solicitante'
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
    
    validatePrices() {
      // Validación en tiempo real de precios
      this.$nextTick(() => {
        if (this.formData.precio_final && this.formData.costo_estimado) {
          const precioFinal = parseFloat(this.formData.precio_final)
          const costoEstimado = parseFloat(this.formData.costo_estimado)
          
          if (precioFinal <= costoEstimado) {
            this.addValidationAlert({
              type: 'warning',
              title: 'Advertencia de Precios',
              message: 'El precio final debe ser mayor que el costo estimado para asegurar rentabilidad.'
            })
          }
        }
      })
    },
    
    async sendForApproval() {
      if (!this.validateForm()) {
        this.showError('Por favor, complete todos los campos obligatorios')
        return
      }
      
      this.saving = true
      try {
        const orderData = this.prepareOrderData('Pendiente Aprobación')
        
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'send_for_approval'
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'send_for_approval'
        })
        
        this.clearDraftFromStorage()
        this.close()
        this.showSuccess('Pedido enviado para aprobación exitosamente')
        
      } catch (error) {
        console.error('Error al enviar para aprobación:', error)
        this.showError(`Error al enviar el pedido: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    async createImmediately() {
      if (!this.validateForm()) {
        this.showError('Por favor, complete todos los campos obligatorios')
        return
      }
      
      this.saving = true
      try {
        const orderData = this.prepareOrderData('Aprobado')
        
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'create_immediately'
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'create_immediately'
        })
        
        this.clearDraftFromStorage()
        this.close()
        this.showSuccess('Pedido creado exitosamente')
        
      } catch (error) {
        console.error('Error al crear pedido:', error)
        this.showError(`Error al crear el pedido: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    async saveDraft() {
      this.saving = true
      try {
        const orderData = {
          codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
          tipo_pedido_id: this.formData.tipo_pedido_id ? parseInt(this.formData.tipo_pedido_id) : null,
          plano_id: this.formData.plano_id ? parseInt(this.formData.plano_id) : null,
          solicitante_id: this.formData.solicitante_id ? parseInt(this.formData.solicitante_id) : null,
          aprobador_id: this.formData.aprobador_id ? parseInt(this.formData.aprobador_id) : null,
          supervisor_id: this.formData.supervisor_id ? parseInt(this.formData.supervisor_id) : null,
          fecha_requerida: this.formData.fecha_requerida || null,
          fecha_estimada_entrega: this.formData.fecha_estimada_entrega || null,
          estado_id: this.getEstadoId('Borrador'),
          prioridad: parseInt(this.formData.prioridad) || 3,
          proyecto_asociado: this.formData.proyecto_asociado || null,
          costo_estimado: this.formData.costo_estimado ? parseFloat(this.formData.costo_estimado) : null,
          precio_final: this.formData.precio_final ? parseFloat(this.formData.precio_final) : null,
          notas: this.formData.notas || null
        }
        
        const response = await fetch('/api/Pedido/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(orderData)
        })
        
        if (response.ok) {
          const result = await response.json()
          this.showSuccess('Borrador guardado exitosamente')
          return result.id
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error al guardar borrador:', error)
        this.showError(`Error al guardar borrador: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    prepareOrderData(estado) {
      // Usar el método corregido del script anterior
      const formatDateForAPI = (date) => {
        if (!date) return null
        const d = new Date(date)
        return d.toISOString().split('T')[0]
      }
      
      const formatDateTimeForAPI = (date) => {
        if (!date) return null
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
      }
      
      const requiredFields = {
        tipo_pedido_id: this.formData.tipo_pedido_id,
        plano_id: this.formData.plano_id,
        solicitante_id: this.formData.solicitante_id,
        fecha_requerida: this.formData.fecha_requerida,
        precio_final: this.formData.precio_final
      }
      
      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value === '' || value === null || value === undefined) {
          throw new Error(`El campo ${field} es obligatorio`)
        }
      }
      
      const orderData = {
        codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
        tipo_pedido_id: parseInt(this.formData.tipo_pedido_id),
        plano_id: parseInt(this.formData.plano_id),
        solicitante_id: parseInt(this.formData.solicitante_id),
        estado_id: this.getEstadoId(estado),
        
        ...(this.formData.aprobador_id && { 
          aprobador_id: parseInt(this.formData.aprobador_id) 
        }),
        ...(this.formData.supervisor_id && { 
          supervisor_id: parseInt(this.formData.supervisor_id) 
        }),
        
        fecha_solicitud: formatDateTimeForAPI(new Date()),
        fecha_requerida: formatDateForAPI(this.formData.fecha_requerida),
        
        ...(estado === 'Aprobado' && { 
          fecha_aprobacion: formatDateTimeForAPI(new Date()) 
        }),
        ...(this.formData.fecha_estimada_entrega && { 
          fecha_estimada_entrega: formatDateForAPI(this.formData.fecha_estimada_entrega) 
        }),
        
        contador_pausas: 0,
        tiempo_total_pausado: 0,
        prioridad: parseInt(this.formData.prioridad) || 3,
        
        ...(this.formData.proyecto_asociado && { 
          proyecto_asociado: this.formData.proyecto_asociado 
        }),
        ...(this.formData.costo_estimado && { 
          costo_estimado: parseFloat(this.formData.costo_estimado) 
        }),
        
        precio_final: parseFloat(this.formData.precio_final),
        
        ...(this.formData.notas && { 
          notas: this.formData.notas 
        }),
        
        createdAt: formatDateTimeForAPI(new Date()),
        updatedAt: formatDateTimeForAPI(new Date())
      }
      
      if (orderData.costo_estimado && orderData.precio_final <= orderData.costo_estimado) {
        throw new Error('El precio final debe ser mayor que el costo estimado')
      }
      
      return orderData
    },
    
    // Métodos auxiliares
    generateOrderCode() {
      const timestamp = new Date().getTime()
      return `PED-${timestamp}`
    },
    
    getEstadoId(estadoNombre) {
      const estadosMap = {
        'Borrador': 1,
        'Pendiente Aprobación': 2,
        'Aprobado': 3,
        'En Proceso': 4,
        'Completado': 5,
        'Cancelado': 6
      }
      return estadosMap[estadoNombre] || 1
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || ''
    },
    
    // Métodos de utilidad para mostrar nombres
    getTipoPedidoName(id) {
      const tipo = this.tiposPedido.find(t => t.id == id)
      return tipo ? tipo.nombre : 'N/A'
    },
    
    getPlanoName(id) {
      const plano = this.planos.find(p => p.id == id)
      return plano ? `${plano.nombre} - ${plano.codigo}` : 'N/A'
    },
    
    getUsuarioName(id) {
      const usuario = this.usuarios.find(u => u.id == id)
      return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'N/A'
    },
    
    getPriorityName(priority) {
      const priorities = {
        1: 'Alta',
        2: 'Media-Alta', 
        3: 'Media',
        4: 'Media-Baja',
        5: 'Baja'
      }
      return priorities[priority] || 'Media'
    },
    
    // Manejo de archivos
    handleFileChange(event) {
      this.processFiles(event.target.files)
    },
    
    handleFileDrop(event) {
      this.processFiles(event.dataTransfer.files)
    },
    
    processFiles(files) {
      for (let file of files) {
        if (this.validateFile(file)) {
          this.uploadedFiles.push(file)
        }
      }
    },
    
    validateFile(file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/dwg',
        'application/dxf'
      ]
      
      if (file.size > maxSize) {
        this.showError(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
        return false
      }
      
      if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
        this.showError(`El archivo ${file.name} no tiene un formato válido.`)
        return false
      }
      
      return true
    },
    
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    
    getFileIcon(fileType) {
      if (fileType.includes('pdf')) return 'picture_as_pdf'
      if (fileType.includes('image')) return 'image'
      if (fileType.includes('dwg') || fileType.includes('dxf')) return 'architecture'
      return 'description'
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    },
    
    // Manejo de alertas
    addValidationAlert(alert) {
      const id = Date.now()
      this.validationAlerts.push({
        id,
        ...alert
      })
      
      // Auto-dismiss después de 5 segundos
      setTimeout(() => {
        this.dismissAlert(id)
      }, 5000)
    },
    
    dismissAlert(alertId) {
      const index = this.validationAlerts.findIndex(a => a.id === alertId)
      if (index > -1) {
        this.validationAlerts.splice(index, 1)
      }
    },
    
    getAlertIcon(type) {
      const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return icons[type] || 'info'
    },
    
    // Notificaciones
    showSuccess(message) {
      if (this.$vaToast) {
        this.$vaToast.init({
          message: message,
          color: 'success',
          duration: 3000
        })
      } else {
        alert(message)
      }
    },
    
    showError(message) {
      if (this.$vaToast) {
        this.$vaToast.init({
          message: message,
          color: 'danger',
          duration: 5000
        })
      } else {
        alert(message)
      }
    },
    
    clearDraftFromStorage() {
      localStorage.removeItem('pedido_draft')
    },
    
    close() {
      this.$emit('close')
    }
  },
  
  // Guardar borrador automáticamente cada 30 segundos si hay cambios
  mounted() {
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveDraftToStorage()
      }
    }, 30000)
  },
  
  beforeDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
  },
  
  methods: {
  
    
    hasUnsavedChanges() {
      // Verificar si hay cambios sin guardar
      const currentData = JSON.stringify(this.formData)
      const savedData = localStorage.getItem('pedido_draft')
      return currentData !== savedData
    },
    
    saveDraftToStorage() {
      localStorage.setItem('pedido_draft', JSON.stringify(this.formData))
    },
    
    loadDraftFromStorage() {
      const savedData = localStorage.getItem('pedido_draft')
      if (savedData && this.mode === 'create') {
        this.formData = JSON.parse(savedData)
        this.addValidationAlert({
          type: 'info',
          title: 'Borrador Recuperado',
          message: 'Se ha recuperado un borrador guardado anteriormente.'
        })
      }
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
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #333;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.section-title .material-icons {
  color: #007bff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input:invalid,
.form-group select:invalid {
  border-color: #dc3545;
}

.input-with-currency {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-weight: 500;
}

.input-with-currency input {
  padding-left: 32px;
}

.field-help {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

.validation-message {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
}

.validation-message.success {
  color: #28a745;
}

.validation-message.error {
  color: #dc3545;
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* Alertas */
.alerts-section {
  margin-bottom: 24px;
}

.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid;
}

.alert-card.success {
  background-color: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

.alert-card.error {
  background-color: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.alert-card.warning {
  background-color: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.alert-card.info {
  background-color: #d1ecf1;
  border-left-color: #17a2b8;
  color: #0c5460;
}

.alert-icon .material-icons {
  font-size: 20px;
}

.alert-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.alert-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.alert-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  margin-left: auto;
}

/* Archivos */
.file-upload-section {
  margin-top: 16px;
}

.file-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: border-color 0.2s;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: #007bff;
}

.upload-label {
  cursor: pointer;
  display: block;
}

.large-icon {
  font-size: 48px !important;
  color: #007bff;
  margin-bottom: 16px;
}

.file-upload-area p {
  margin: 8px 0;
  color: #333;
}

.small-text {
  font-size: 12px !important;
  color: #666 !important;
}

.uploaded-files {
  margin-top: 20px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.file-list {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-meta {
  font-size: 12px;
  color: #666;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.icon-btn.small .material-icons {
  font-size: 18px;
}

/* Resumen */
.order-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e5e5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e5e5;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 500;
  color: #666;
}

.summary-value {
  color: #333;
  font-weight: 500;
}

.summary-value.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.priority-1 {
  background-color: #dc3545;
  color: white;
}

.priority-2 {
  background-color: #fd7e14;
  color: white;
}

.priority-3 {
  background-color: #ffc107;
  color: #212529;
}

.priority-4 {
  background-color: #20c997;
  color: white;
}

.priority-5 {
  background-color: #6c757d;
  color: white;
}

.summary-value.price {
  color: #28a745;
  font-weight: 600;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background-color: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn.success {
  background-color: #28a745;
  color: white;
}

.btn.success:hover:not(:disabled) {
  background-color: #1e7e34;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-footer {
    flex-wrap: wrap;
  }
  
  .btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>