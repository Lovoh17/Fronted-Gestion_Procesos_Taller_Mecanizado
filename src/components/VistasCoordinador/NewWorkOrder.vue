<template>
  <div class="work-order-template">
    <div class="template-header">
      <h2>{{ mode === 'create' ? 'Nueva Orden de Trabajo' : 'Editar Orden #' + formData.codigo_pedido }}</h2>
      <button class="back-btn" @click="goBack">
        <span class="material-icons">arrow_back</span> Volver
      </button>
    </div>
    
    <div class="template-body">
      <!-- Loading indicator -->
      <div v-if="loadingCatalogs" class="loading-section">
        <div class="loading-spinner"></div>
        <p>Cargando infrmación...</p>
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
              :placeholder="mode === 'create' ? 'Se generará automáticamente: ' + previewOrderCode : 'Código asignado'"
            >
            <small v-if="mode === 'create'" class="field-help">
              Formato: PED-{{ getTipoAcronym() }}-UNIVO-{{ formatDateForCode(formData.fecha_requerida) }}
            </small>
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
                {{ (usuario.nombre || usuario.name || 'Sin nombre') }} {{ (usuario.apellido || usuario.lastname || '') }}
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
                {{ (usuario.nombre || usuario.name || 'Sin nombre') }} {{ (usuario.apellido || usuario.lastname || '') }}
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
                {{ (usuario.nombre|| usuario.name || 'Sin nombre') }} {{ (usuario.apellido || usuario.lastname || '') }}
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
    
    <div class="template-footer">
      <button class="btn secondary" @click="goBack">Cancelar</button>
      <button 
        class="btn primary" 
        @click="save" 
        :disabled="loadingCatalogs || saving"
      >
        {{ saving ? 'Guardando...' : (mode === 'create' ? 'Crear Orden' : 'Actualizar') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkOrderTemplate',
  props: {
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
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        prioridad: 3,
        proyecto_asociado: '',
        costo_estimado: '',
        precio_final: '',
        notas: ''
      },
      errors: {},
      
      // Data arrays
      tiposPedido: [],
      planos: [],
      usuarios: [],
      usuariosAprobadores: [],
      usuariosSupervisores: [],
      estadosPedido: [],
      
      // Loading states
      loadingCatalogs: false,
      loadingError: null,
      saving: false
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
    },
    previewOrderCode() {
      if (this.mode === 'edit') return this.formData.codigo_pedido
      
      const tipoAcronym = this.getTipoAcronym()
      const fechaCodigo = this.formatDateForCode(this.formData.fecha_requerida)
      
      return `PED-${tipoAcronym}-UNIVO-${fechaCodigo}-XXXXXX`
    }
  },
  mounted() {
    this.initializeForm()
    this.loadCatalogs()
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
        // Cargar Tipos de Pedido
        try {
          const tiposResponse = await fetch('/api/Tipo_Pedido', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (tiposResponse.ok) {
            const tiposData = await tiposResponse.json()
            if (Array.isArray(tiposData)) {
              this.tiposPedido = tiposData
            } else {
              this.tiposPedido = []
            }
          }
        } catch (error) {
          console.error('Error cargando tipos de pedido:', error)
        }
        
        // Cargar Planos
        try {
          const planosResponse = await fetch('/api/Plano', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (planosResponse.ok) {
            const planosData = await planosResponse.json()
            if (Array.isArray(planosData)) {
              this.planos = planosData
            } else {
              this.planos = []
            }
          }
        } catch (error) {
          console.error('Error cargando planos:', error)
        }
        
        // Cargar Usuarios Solicitantes (Puesto 5)
        try {
          const usuariosResponse = await fetch('/api/Usuario/Puesto/5', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (usuariosResponse.ok) {
            const usuariosData = await usuariosResponse.json()
            if (Array.isArray(usuariosData)) {
              this.usuarios = usuariosData
            } else {
              this.usuarios = []
            }
          }
        } catch (error) {
          console.error('Error cargando usuarios solicitantes:', error)
        }
        
        // Cargar Usuarios Aprobadores (Puesto 1)
        try {
          const aprobadoresResponse = await fetch('/api/Usuario/Puesto/1', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (aprobadoresResponse.ok) {
            const aprobadoresData = await aprobadoresResponse.json()
            if (Array.isArray(aprobadoresData)) {
              this.usuariosAprobadores = aprobadoresData
            } else {
              this.usuariosAprobadores = []
            }
          }
        } catch (error) {
          console.error('Error cargando usuarios aprobadores:', error)
        }
        
        // Cargar Usuarios Supervisores (Puesto 2)
        try {
          const supervisoresResponse = await fetch('/api/Usuario/Puesto/2', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (supervisoresResponse.ok) {
            const supervisoresData = await supervisoresResponse.json()
            if (Array.isArray(supervisoresData)) {
              this.usuariosSupervisores = supervisoresData
            } else {
              this.usuariosSupervisores = []
            }
          }
        } catch (error) {
          console.error('Error cargando usuarios supervisores:', error)
        }
        
        // Cargar Estados de Pedido
        try {
          const estadosResponse = await fetch('/api/EstadoPedido', {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}` 
            }
          })
          
          if (estadosResponse.ok) {
            const estadosData = await estadosResponse.json()
            if (Array.isArray(estadosData)) {
              this.estadosPedido = estadosData
            } else {
              this.estadosPedido = []
            }
          }
        } catch (error) {
          console.error('Error cargando estados de pedido:', error)
        }
        
      } catch (error) {
        this.loadingError = `Error de carga: ${error.message}`
      } finally {
        this.loadingCatalogs = false
      }
    },
    
    async retryLoad() {
      await this.loadCatalogs()
    },
    
    getTipoAcronym() {
      if (!this.formData.tipo_pedido_id) return 'XX'
      
      const tipoSeleccionado = this.tiposPedido.find(
        tipo => tipo.id == this.formData.tipo_pedido_id
      )
      
      if (!tipoSeleccionado) return 'XX'
      
      const nombre = (tipoSeleccionado.nombre || tipoSeleccionado.name || '').toLowerCase()
      
      // Mapeo de tipos a acrónimos
      if (nombre.includes('externo')) return 'EX'
      if (nombre.includes('interno')) return 'IN'
      if (nombre.includes('estudiante')) return 'EST'
      if (nombre.includes('urgente')) return 'UR'
      
      // Por defecto, usar las primeras 2 letras del nombre
      return nombre.substring(0, 2).toUpperCase() || 'XX'
    },
    
    formatDateForCode(fecha) {
      if (!fecha) return 'YYYYMMDD'
      
      const date = new Date(fecha)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      return `${year}${month}${day}`
    },
    
    async generateUniqueOrderCode() {
      // Método simple: generar código único sin consultar BD
      const tipoAcronym = this.getTipoAcronym()
      const fechaCodigo = this.formatDateForCode(this.formData.fecha_requerida)
      
      // Generar ID único más robusto
      const now = new Date()
      const timestamp = now.getTime().toString().slice(-8) // 8 dígitos del timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0') // 3 dígitos random
      
      return `PED-${tipoAcronym}-UNIVO-${fechaCodigo}-${timestamp}${random}`
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
    
    async prepareOrderData() {
      // Generar código único
      const codigoPedido = this.formData.codigo_pedido || await this.generateUniqueOrderCode()
      
      const orderData = {
        codigo_pedido: codigoPedido,
        tipo_pedido_id: parseInt(this.formData.tipo_pedido_id),
        plano_id: parseInt(this.formData.plano_id),
        solicitante_id: parseInt(this.formData.solicitante_id),
        fecha_solicitud: new Date().toISOString(), // Usar ISO completo como en la BD
        fecha_requerida: this.formData.fecha_requerida,
        estado_id: 1, // Estado inicial
        prioridad: parseInt(this.formData.prioridad),
        precio_final: parseFloat(this.formData.precio_final).toFixed(2) // Formato decimal como en BD
      }
      
      // Campos opcionales - solo agregar si tienen valor válido
      if (this.formData.aprobador_id && this.formData.aprobador_id !== '') {
        orderData.aprobador_id = parseInt(this.formData.aprobador_id)
      }
      
      if (this.formData.supervisor_id && this.formData.supervisor_id !== '') {
        orderData.supervisor_id = parseInt(this.formData.supervisor_id)
      }
      
      if (this.formData.fecha_estimada_entrega && this.formData.fecha_estimada_entrega !== '') {
        orderData.fecha_estimada_entrega = this.formData.fecha_estimada_entrega
      }
      
      if (this.formData.proyecto_asociado && this.formData.proyecto_asociado.trim() !== '') {
        orderData.proyecto_asociado = this.formData.proyecto_asociado.trim()
      }
      
      if (this.formData.costo_estimado && this.formData.costo_estimado !== '') {
        const costo = parseFloat(this.formData.costo_estimado)
        if (!isNaN(costo) && costo >= 0) {
          orderData.costo_estimado = costo.toFixed(2) // Formato decimal como en BD
        }
      }
      
      if (this.formData.notas && this.formData.notas.trim() !== '') {
        orderData.notas = this.formData.notas.trim()
      }
      
      // Campos adicionales que están en la BD pero no en el form
      orderData.pausado_desde = null
      orderData.pausado_hasta = null
      orderData.razon_pausa_actual_id = null
      orderData.contador_pausas = 0
      orderData.tiempo_total_pausado = "0"
      
      return orderData
    },
    
    async save() {
      if (!this.validateForm()) {
        return
      }
      
      this.saving = true
      
      try {
        const orderData = await this.prepareOrderData()
        
        // Debug: mostrar datos que se envían
        console.log('📤 Datos a enviar:', JSON.stringify(orderData, null, 2))
        
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
        
        console.log('📡 Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          // Obtener detalles del error del servidor
          let errorData = {}
          try {
            errorData = await response.json()
            console.error('❌ Error del servidor:', errorData)
          } catch (e) {
            console.error('❌ Error parsing response:', e)
          }
          
          // Mostrar error más detallado
          const errorMessage = errorData.message || 
                              errorData.error || 
                              `Error ${response.status}: ${response.statusText}`
          throw new Error(errorMessage)
        }
        
        const result = await response.json()
        console.log('✅ Orden guardada exitosamente:', result)
        
        this.$emit('saved', result)
        this.goBack()
        
      } catch (error) {
        console.error('💥 Error completo:', error)
        alert('Error al guardar la orden de trabajo: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || localStorage.getItem('token') || ''
    },
    
    goBack() {
      this.$emit('back')
    }
  }
}
</script>

<style src="/src/assets/StyleCoordinador/NewWorkOrderStyle.css" scoped></style>

<style scoped>

  .work-order-template {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 2px solid #f3f4f6;
}

.template-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.back-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.template-body {
  margin-bottom: 24px;
}

.template-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0 0;
  border-top: 1px solid #e5e7eb;
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 24px;
  background: #ffffff;
  padding: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  flex: 0 0 100%;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-group label::after {
  content: attr(data-required);
  color: #dc2626;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background: #ffffff;
  color: #111827;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover {
  border-color: #9ca3af;
}

.form-group select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 32px;
  appearance: none;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.field-help {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: '⚠';
  font-size: 12px;
}

/* Botones */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn.primary {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn.primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn.primary:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.btn.secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Checkboxes */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  accent-color: #3b82f6;
}

/* Estados de carga */
.loading-section {
  text-align: center;
  padding: 40px 0;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-section p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.error-section {
  text-align: center;
  padding: 24px;
  background: #fef2f2;
  color: #7f1d1d;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
}

.error-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}

.error-section p {
  margin-bottom: 16px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .work-order-template {
    padding: 16px;
    margin: 16px;
  }
  
  .template-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .template-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* Estados de validación */
.form-group input:invalid {
  border-color: #fca5a5;
  background-color: #fef2f2;
}

.form-group input:valid {
  border-color: #86efac;
}

/* Placeholder mejorado */
.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}

</style>