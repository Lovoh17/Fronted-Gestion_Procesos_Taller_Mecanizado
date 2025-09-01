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
  console.log('🚀 INICIANDO loadCatalogs...')
  this.loadingCatalogs = true
  this.loadingError = null
  
  try {
    console.log('🔄 Cargando catálogos...')
    console.log('🔑 Token:', this.getAuthToken() ? 'Existe' : 'No existe')
    
    // Cargar Tipos de Pedido
    console.log('📡 Iniciando carga de Tipos de Pedido...')
    try {
      const tiposResponse = await fetch('/api/Tipo_Pedido', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Tipos de Pedido:', {
        status: tiposResponse.status,
        statusText: tiposResponse.statusText,
        ok: tiposResponse.ok,
        url: tiposResponse.url
      })
      
      if (tiposResponse.ok) {
        const tiposData = await tiposResponse.json()
        console.log('📦 Data Tipos de Pedido (raw):', tiposData)
        console.log('📦 Es array?', Array.isArray(tiposData))
        
        if (Array.isArray(tiposData)) {
          this.tiposPedido = tiposData
          console.log('✅ Tipos de Pedido asignados:', this.tiposPedido.length, this.tiposPedido)
        } else {
          console.log('⚠️ Tipos de Pedido no es array, intentando extraer...')
          this.tiposPedido = []
        }
      } else {
        const errorText = await tiposResponse.text()
        console.error('❌ Error response Tipos de Pedido:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando tipos de pedido:', error)
    }
    
    // Cargar Planos
    console.log('📡 Iniciando carga de Planos...')
    try {
      const planosResponse = await fetch('/api/Plano', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Planos:', {
        status: planosResponse.status,
        statusText: planosResponse.statusText,
        ok: planosResponse.ok
      })
      
      if (planosResponse.ok) {
        const planosData = await planosResponse.json()
        console.log('📦 Data Planos (raw):', planosData)
        console.log('📦 Es array?', Array.isArray(planosData))
        
        if (Array.isArray(planosData)) {
          this.planos = planosData
          console.log('✅ Planos asignados:', this.planos.length, this.planos)
        } else {
          console.log('⚠️ Planos no es array, intentando extraer...')
          this.planos = []
        }
      } else {
        const errorText = await planosResponse.text()
        console.error('❌ Error response Planos:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando planos:', error)
    }
    
    // Cargar Usuarios Solicitantes (Puesto 5)
    console.log('📡 Iniciando carga de Usuarios Solicitantes...')
    try {
      const usuariosResponse = await fetch('/api/Usuario/Puesto/5', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Usuarios Solicitantes:', {
        status: usuariosResponse.status,
        statusText: usuariosResponse.statusText,
        ok: usuariosResponse.ok
      })
      
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json()
        console.log('📦 Data Usuarios Solicitantes (raw):', usuariosData)
        console.log('📦 Es array?', Array.isArray(usuariosData))
        
        if (Array.isArray(usuariosData)) {
          this.usuarios = usuariosData
          console.log('✅ Usuarios Solicitantes asignados:', this.usuarios.length, this.usuarios)
        } else {
          console.log('⚠️ Usuarios Solicitantes no es array, intentando extraer...')
          this.usuarios = []
        }
      } else {
        const errorText = await usuariosResponse.text()
        console.error('❌ Error response Usuarios Solicitantes:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios solicitantes:', error)
    }
    
    // Cargar Usuarios Aprobadores (Puesto 1)
    console.log('📡 Iniciando carga de Usuarios Aprobadores...')
    try {
      const aprobadoresResponse = await fetch('/api/Usuario/Puesto/1', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Usuarios Aprobadores:', {
        status: aprobadoresResponse.status,
        statusText: aprobadoresResponse.statusText,
        ok: aprobadoresResponse.ok
      })
      
      if (aprobadoresResponse.ok) {
        const aprobadoresData = await aprobadoresResponse.json()
        console.log('📦 Data Usuarios Aprobadores (raw):', aprobadoresData)
        console.log('📦 Es array?', Array.isArray(aprobadoresData))
        
        if (Array.isArray(aprobadoresData)) {
          this.usuariosAprobadores = aprobadoresData
          console.log('✅ Usuarios Aprobadores asignados:', this.usuariosAprobadores.length, this.usuariosAprobadores)
        } else {
          console.log('⚠️ Usuarios Aprobadores no es array, intentando extraer...')
          this.usuariosAprobadores = []
        }
      } else {
        const errorText = await aprobadoresResponse.text()
        console.error('❌ Error response Usuarios Aprobadores:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios aprobadores:', error)
    }
    
    // Cargar Usuarios Supervisores (Puesto 2)
    console.log('📡 Iniciando carga de Usuarios Supervisores...')
    try {
      const supervisoresResponse = await fetch('/api/Usuario/Puesto/2', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Usuarios Supervisores:', {
        status: supervisoresResponse.status,
        statusText: supervisoresResponse.statusText,
        ok: supervisoresResponse.ok
      })
      
      if (supervisoresResponse.ok) {
        const supervisoresData = await supervisoresResponse.json()
        console.log('📦 Data Usuarios Supervisores (raw):', supervisoresData)
        console.log('📦 Es array?', Array.isArray(supervisoresData))
        
        if (Array.isArray(supervisoresData)) {
          this.usuariosSupervisores = supervisoresData
          console.log('✅ Usuarios Supervisores asignados:', this.usuariosSupervisores.length, this.usuariosSupervisores)
        } else {
          console.log('⚠️ Usuarios Supervisores no es array, intentando extraer...')
          this.usuariosSupervisores = []
        }
      } else {
        const errorText = await supervisoresResponse.text()
        console.error('❌ Error response Usuarios Supervisores:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios supervisores:', error)
    }
    
    // Cargar Estados de Pedido
    console.log('📡 Iniciando carga de Estados de Pedido...')
    try {
      const estadosResponse = await fetch('/api/EstadoPedido', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` 
        }
      })
      
      console.log('📊 Response Estados de Pedido:', {
        status: estadosResponse.status,
        statusText: estadosResponse.statusText,
        ok: estadosResponse.ok
      })
      
      if (estadosResponse.ok) {
        const estadosData = await estadosResponse.json()
        console.log('📦 Data Estados de Pedido (raw):', estadosData)
        console.log('📦 Es array?', Array.isArray(estadosData))
        
        if (Array.isArray(estadosData)) {
          this.estadosPedido = estadosData
          console.log('✅ Estados de Pedido asignados:', this.estadosPedido.length, this.estadosPedido)
        } else {
          console.log('⚠️ Estados de Pedido no es array, intentando extraer...')
          this.estadosPedido = []
        }
      } else {
        const errorText = await estadosResponse.text()
        console.error('❌ Error response Estados de Pedido:', errorText)
      }
    } catch (error) {
      console.error('❌ Error cargando estados de pedido:', error)
    }
    
    console.log('📊 RESUMEN FINAL - Estado de arrays después de carga:')
    console.log('   tiposPedido:', this.tiposPedido?.length || 0, this.tiposPedido)
    console.log('   planos:', this.planos?.length || 0, this.planos)
    console.log('   usuarios:', this.usuarios?.length || 0, this.usuarios)
    console.log('   usuariosAprobadores:', this.usuariosAprobadores?.length || 0, this.usuariosAprobadores)
    console.log('   usuariosSupervisores:', this.usuariosSupervisores?.length || 0, this.usuariosSupervisores)
    console.log('   estadosPedido:', this.estadosPedido?.length || 0, this.estadosPedido)
    
  } catch (error) {
    console.error('❌ Error general en loadCatalogs:', error)
    this.loadingError = `Error de carga: ${error.message}`
  } finally {
    this.loadingCatalogs = false
    console.log('✅ loadCatalogs FINALIZADO - loadingCatalogs:', this.loadingCatalogs)
  }
},

// También elimina completamente el método loadSingleAPI() ya que no lo necesitas
    
    /*async loadSingleAPI(url, dataProperty, displayName) {
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
    },*/
    
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

<style src="/src/assets/StyleCoordinador/NewWorkOrderStyle.css" ></style>