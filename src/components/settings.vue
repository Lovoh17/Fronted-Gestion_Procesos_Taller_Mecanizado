<template>
  <div class="configuracion-view">
    <div class="container">
      <h1>Configuración del Sistema</h1>
      
      <!-- Tabs principales -->
      <div class="main-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Contenido de Tipos -->
      <div v-if="activeTab === 'tipos'" class="tipos-section">
        <!-- Sub-tabs para tipos -->
        <div class="sub-tabs">
          <button 
            v-for="subtab in tipoSubtabs" 
            :key="subtab.key"
            @click="activeTipoTab = subtab.key"
            :class="['subtab-button', { active: activeTipoTab === subtab.key }]"
          >
            {{ subtab.label }}
          </button>
        </div>

        <!-- Tabla de configuración para tipos -->
        <ConfigTable
          :columns="currentConfig.columns"
          :data="currentConfig.data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', activeTipoTab, data)"
          @update="(data) => handleGenericCRUD('update', activeTipoTab, data)"
          @delete="(id) => handleGenericCRUD('delete', activeTipoTab, id)"
        />
      </div>

      <!-- Contenido de Alertas -->
      <div v-if="activeTab === 'alertas'" class="alertas-section">
        <ConfigTable
          :columns="entityConfigs.alertas.columns"
          :data="entityConfigs.alertas.data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', 'alertas', data)"
          @update="(data) => handleGenericCRUD('update', 'alertas', data)"
          @delete="(id) => handleGenericCRUD('delete', 'alertas', id)"
        />
      </div>

      <!-- Contenido de Métodos de Pago -->
      <div v-if="activeTab === 'metodos-pago'" class="metodos-pago-section">
        <ConfigTable
          :columns="entityConfigs['metodos-pago'].columns"
          :data="entityConfigs['metodos-pago'].data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', 'metodos-pago', data)"
          @update="(data) => handleGenericCRUD('update', 'metodos-pago', data)"
          @delete="(id) => handleGenericCRUD('delete', 'metodos-pago', id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ConfigTable from '@/components/GlobalComponents/ConfigTable.vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import axios from 'axios'

export default {
  name: 'ConfiguracionView',
  components: {
    ConfigTable
  },
  data() {
    return {
      loading: false,
      activeTab: 'tipos',
      activeTipoTab: 'tipo-herramientas',
      
      tabs: [
        { key: 'tipos', label: 'Tipos' },
        { key: 'alertas', label: 'Alertas' },
        { key: 'metodos-pago', label: 'Métodos de Pago' }
      ],
      
      tipoSubtabs: [
        { key: 'tipo-herramientas', label: 'Tipos de Herramientas' },
        { key: 'tipo-mantenimiento', label: 'Tipos de Mantenimiento' },
        { key: 'tipo-transaccion', label: 'Tipos de Transacción' },
        { key: 'tipo-telefono', label: 'Tipos de Teléfono' },
        { key: 'unidad-medida', label: 'Unidades de Medida' },
        { key: 'turno', label: 'Turnos' }
      ],
      
      // Configuración centralizada para todas las entidades
      entityConfigs: {
        'tipo-herramientas': {
          endpoint: 'Tipo_Herramienta',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' },
            { field: 'caracteristicas_clave', label: 'Características Clave' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data, isCreate = false) => {
            console.log('PrepareData para tipo-herramientas recibió:', data)
            
            // Create the base result object with required fields
            const result = {
              nombre: data.nombre,
              descripcion: data.descripcion || '',
              caracteristicas_clave: data.caracteristicas_clave || ''
            }

            // Only include ID if it exists and this is an update operation
            if (!isCreate && data.id && data.id !== '' && data.id !== 0) {
              result.id = data.id
              console.log('Incluyendo ID para actualización:', data.id)
            } else {
              console.log('Omisión de ID para nuevo registro')
            }

            console.log('PrepareData para tipo-herramientas devuelve:', result)
            return result
          }
        },
        
        'tipo-mantenimiento': {
          endpoint: 'Tipo_Mantenimiento',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data, isCreate = false) => {
            console.log('PrepareData para tipo-telefono recibió:', data)
            
            // Create the base result object with required fields
            const result = {
              nombre: data.nombre,
              descripcion: data.descripcion || ''
            }

            // Para tipo-telefono, NUNCA incluir ID en creaciones porque
            // el backend lo ignora y puede causar problemas
            if (!isCreate && data.id && data.id !== '' && data.id !== 0) {
              result.id = data.id
              console.log('Incluyendo ID para actualización:', data.id)
            } else {
              console.log('Omisión de ID - el backend lo generará automáticamente')
            }

            console.log('PrepareData para tipo-telefono devuelve:', result)
            return result
          }
        },
        
        'tipo-transaccion': {
          endpoint: 'Tipos_Transaccion',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' },
            { field: 'afecta_ingresos', label: 'Afecta Ingresos', type: 'boolean' },
            { field: 'afecta_gastos', label: 'Afecta Gastos', type: 'boolean' },
            { field: 'es_interno', label: 'Es Interno', type: 'boolean' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data) => ({
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            afecta_ingresos: Boolean(data.afecta_ingresos),
            afecta_gastos: Boolean(data.afecta_gastos),
            es_interno: Boolean(data.es_interno)
          })
        },
        
        'tipo-telefono': {
          endpoint: 'Tipo_Telefono',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data) => ({
            nombre: data.nombre,
            descripcion: data.descripcion || ''
          })
        },
        
        'unidad-medida': {
          endpoint: 'Unidad_Medida',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'abreviatura', label: 'Abreviatura', required: true },
            { field: 'tipo', label: 'Tipo' }
          ],
          requiredFields: ['nombre', 'abreviatura'],
          prepareData: (data) => ({
            nombre: data.nombre,
            abreviatura: data.abreviatura,
            tipo: data.tipo || ''
          })
        },
        
        turno: {
          endpoint: 'Turno',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' },
            { field: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true },
            { field: 'hora_fin', label: 'Hora Fin', type: 'time', required: true },
            { field: 'dias_semana', label: 'Días de la Semana' }
          ],
          requiredFields: ['nombre', 'hora_inicio', 'hora_fin'],
          prepareData: (data) => ({
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            hora_inicio: data.hora_inicio,
            hora_fin: data.hora_fin,
            dias_semana: data.dias_semana || ''
          })
        },
        
        alertas: {
          endpoint: 'AlertaReparacion',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' },
            { field: 'activo', label: 'Activo', type: 'boolean' },
            { field: 'umbral', label: 'Umbral', type: 'number' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data) => ({
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            activo: Boolean(data.activo),
            umbral: parseInt(data.umbral) || 0
          })
        },
        
        'metodos-pago': {
          endpoint: 'MetodoPago',
          data: [],
          columns: [
            { field: 'id', label: 'ID', readonly: true },
            { field: 'nombre', label: 'Nombre', required: true },
            { field: 'descripcion', label: 'Descripción' },
            { field: 'requiere_referencia', label: 'Requiere Referencia', type: 'boolean' }
          ],
          requiredFields: ['nombre'],
          prepareData: (data) => ({
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            requiere_referencia: Boolean(data.requiere_referencia)
          })
        }
      }
    }
  },
  
  created() {
    this.initializeApi()
    this.loadAllData()
  },
  
  computed: {
    currentConfig() {
      return this.entityConfigs[this.activeTipoTab] || { columns: [], data: [] }
    }
  },
  
  methods: {
    initializeApi() {
      if (!this.$api) {
        this.api = axios.create({
          baseURL: 'http://localhost:3000/',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        })
      } else {
        this.api = this.$api
      }
    },

    // Nuevo método para generar ID consecutivo
    generateNextId(entityKey) {
      console.log('=== GENERANDO PRÓXIMO ID ===')
      const config = this.entityConfigs[entityKey]
      
      if (!config || !config.data || config.data.length === 0) {
        console.log('No hay datos existentes, retornando ID: 1')
        return 1
      }
      
      // Obtener todos los IDs existentes y encontrar el máximo
      const existingIds = config.data
        .map(item => parseInt(item.id))
        .filter(id => !isNaN(id))
        .sort((a, b) => b - a) // Ordenar descendente
      
      const maxId = existingIds.length > 0 ? existingIds[0] : 0
      const nextId = maxId + 1
      
      console.log('IDs existentes:', existingIds)
      console.log('ID máximo encontrado:', maxId)
      console.log('Próximo ID a usar:', nextId)
      
      return nextId
    },

    // Método para verificar si el backend maneja IDs automáticamente
    shouldGenerateId(entityKey) {
      // Lista de entidades que manejan IDs automáticamente en el backend
      // Basado en tu controlador, el backend NO usa el ID que enviamos,
      // por lo que es mejor omitirlo y dejar que el backend/DB lo genere
      const autoIdEntities = [
        'tipo-telefono', 
        'tipo-herramientas', 
        'tipo-mantenimiento',
        'tipo-transaccion',
        'unidad-medida',
        'turno',
        'alertas',
        'metodos-pago'
      ]
      
      // Si está en la lista, el backend genera el ID automáticamente
      return !autoIdEntities.includes(entityKey)
    },
    
    async loadAllData() {
      this.loading = true
      try {
        const promises = Object.keys(this.entityConfigs).map(async (key) => {
          const config = this.entityConfigs[key]
          try {
            const response = await this.api.get(config.endpoint)
            config.data = response.data || []
          } catch (error) {
            console.error(`Error cargando ${key}:`, error)
            config.data = []
          }
        })
        
        await Promise.all(promises)
      } catch (error) {
        console.error('Error cargando configuración:', error)
        toast.error('Error al cargar la configuración')
      } finally {
        this.loading = false
      }
    },
    
    validateData(entityKey, data) {
      const config = this.entityConfigs[entityKey]
      if (!config) {
        throw new Error(`Configuración no encontrada para ${entityKey}`)
      }
      
      const requiredFields = config.requiredFields || ['nombre']
      
      for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
          throw new Error(`El campo ${field} es requerido`)
        }
      }
      return true
    },
    
    prepareDataForEntity(entityKey, data, isCreate = false) {
      console.log('=== PrepareDataForEntity ===')
      console.log('EntityKey:', entityKey)
      console.log('IsCreate:', isCreate)
      console.log('Data original:', data)
      
      const config = this.entityConfigs[entityKey]
      if (!config || !config.prepareData) {
        throw new Error(`Configuración no encontrada para ${entityKey}`)
      }
      
      const preparedData = { ...data }
      
      // Si es creación, decidir si generar ID o dejarlo al backend
      if (isCreate) {
        if (this.shouldGenerateId(entityKey)) {
          const nextId = this.generateNextId(entityKey)
          preparedData.id = nextId
          console.log('ID generado para creación:', nextId)
        } else {
          // Eliminar ID para que el backend lo genere automáticamente
          delete preparedData.id
          console.log('ID omitido - el backend lo generará automáticamente')
        }
      } else {
        // Para actualizar: mantener el ID solo si existe y no es 0
        if (!data.id || data.id === 0 || data.id === '') {
          delete preparedData.id
          console.log('ID eliminado del preparedData para actualización')
        }
      }
      
      console.log('PreparedData antes de config.prepareData:', preparedData)
      const result = config.prepareData(preparedData, isCreate)
      console.log('Resultado final de prepareDataForEntity:', result)
      
      return result
    },
    
    async loadDataForEntity(entityKey) {
      try {
        const config = this.entityConfigs[entityKey]
        if (!config) return
        
        const response = await this.api.get(config.endpoint)
        config.data = response.data || []
      } catch (error) {
        console.error(`Error cargando datos para ${entityKey}:`, error)
      }
    },
    
    // Método genérico para CRUD
    async handleGenericCRUD(operation, entityKey, dataOrId) {
      console.log(`=== CRUD ${operation.toUpperCase()} ===`)
      console.log('EntityKey:', entityKey)
      console.log('Data/ID:', dataOrId)
      
      try {
        const config = this.entityConfigs[entityKey]
        if (!config) {
          throw new Error(`Configuración no encontrada para ${entityKey}`)
        }
        
        let result
        switch (operation) {
          case 'create':
            result = await this.handleCreate(entityKey, dataOrId)
            break
          case 'update':
            result = await this.handleUpdate(entityKey, dataOrId)
            break
          case 'delete':
            result = await this.handleDelete(entityKey, dataOrId)
            break
        }
        return result
      } catch (error) {
        console.error(`=== ERROR EN ${operation.toUpperCase()} ===`)
        console.error('EntityKey:', entityKey)
        console.error('Error completo:', error)
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        
        let errorMessage = `Error al ${this.getOperationLabel(operation)}`
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        // Mensajes específicos para errores comunes
        if (errorMessage.includes('llave duplicada') || errorMessage.includes('duplicate key')) {
          errorMessage = 'Ya existe un registro con esos datos. Verifica que el nombre no esté repetido.'
        } else if (errorMessage.includes('violates foreign key')) {
          errorMessage = 'Error de relación con otros datos. Verifica que todos los campos sean válidos.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Error interno del servidor. Revisa la consola del backend para más detalles.'
        }
        
        toast.error(errorMessage)
        throw error
      }
    },
    
    getOperationLabel(operation) {
      const labels = {
        'create': 'crear',
        'update': 'actualizar', 
        'delete': 'eliminar'
      }
      return labels[operation] || operation
    },
    
    async handleCreate(entityKey, data) {
      console.log('=== DEBUG CREAR ===')
      console.log('1. Datos originales recibidos:', data)
      console.log('2. EntityKey:', entityKey)
      
      // Refrescar los datos antes de crear para asegurar que tenemos la info más actualizada
      await this.loadDataForEntity(entityKey)
      
      this.validateData(entityKey, data)
      const preparedData = this.prepareDataForEntity(entityKey, data, true)
      const config = this.entityConfigs[entityKey]
      
      console.log('3. Datos después de prepareData:', preparedData)
      console.log('4. Endpoint a usar:', config.endpoint)
      console.log('5. URL completa:', `${this.api.defaults.baseURL}${config.endpoint}`)
      
      // Crear los datos finales
      const finalData = { ...preparedData }
      console.log('6. Datos finales a enviar:', finalData)
      console.log('7. JSON stringify:', JSON.stringify(finalData))
      
      try {
        const response = await this.api.post(config.endpoint, finalData)
        console.log('8. Respuesta exitosa:', response.data)
        
        const successMessage = finalData.id 
          ? `${this.getEntityLabel(entityKey)} creado correctamente con ID ${finalData.id}`
          : `${this.getEntityLabel(entityKey)} creado correctamente`
        
        toast.success(successMessage)
        await this.loadDataForEntity(entityKey)
        return response
      } catch (error) {
        console.error('=== ERROR DETALLADO ===')
        console.error('Status:', error.response?.status)
        console.error('Status Text:', error.response?.statusText)
        console.error('Response Data:', error.response?.data)
        console.error('Response Headers:', error.response?.headers)
        console.error('Request Config:', error.config)
        console.error('Request Data:', error.config?.data)
        console.error('Network Error:', error.code)
        
        // Información adicional para debugging
        if (error.response?.status === 500) {
          console.error('=== INFORMACIÓN ADICIONAL PARA ERROR 500 ===')
          console.error('Esto es un error del servidor. Posibles causas:')
          console.error('1. Campo requerido faltante en la base de datos')
          console.error('2. Violación de constraint (unique, foreign key, etc.)')
          console.error('3. Tipo de dato incorrecto')
          console.error('4. Tabla no existe o estructura incorrecta')
          console.error('5. Error en el endpoint del backend')
          console.error('Datos enviados al servidor:', finalData)
          console.error('Revisar logs del backend para más detalles')
        }
        
        // Re-lanzar el error para que lo maneje el método padre
        throw error
      }
    },
    
    async handleUpdate(entityKey, data) {
      this.validateData(entityKey, data)
      const preparedData = this.prepareDataForEntity(entityKey, data, false) // Pasar false para indicar que es actualización
      const config = this.entityConfigs[entityKey]
      
      console.log('Datos preparados para actualizar:', preparedData) // Debug
      
      const response = await this.api.put(`${config.endpoint}/${data.id}`, preparedData)
      toast.success(`${this.getEntityLabel(entityKey)} actualizado correctamente`)
      await this.loadDataForEntity(entityKey)
      return response
    },
    
    async handleDelete(entityKey, id) {
      if (!confirm(`¿Estás seguro de que deseas eliminar este ${this.getEntityLabel(entityKey).toLowerCase()}?`)) {
        return
      }
      
      const config = this.entityConfigs[entityKey]
      await this.api.delete(`${config.endpoint}/${id}`)
      toast.success(`${this.getEntityLabel(entityKey)} eliminado correctamente`)
      await this.loadDataForEntity(entityKey)
    },
    
    getEntityLabel(entityKey) {
      const labels = {
        'tipo-herramientas': 'Tipo de herramienta',
        'tipo-mantenimiento': 'Tipo de mantenimiento',
        'tipo-transaccion': 'Tipo de transacción',
        'tipo-telefono': 'Tipo de teléfono',
        'unidad-medida': 'Unidad de medida',
        'turno': 'Turno',
        'alertas': 'Alerta',
        'metodos-pago': 'Método de pago'
      }
      return labels[entityKey] || entityKey
    }
  }
}
</script>

<style scoped>
.configuracion-view {
  padding: 20px;
}

.main-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: bold;
}

.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.subtab-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.subtab-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.subtab-button:hover:not(.active) {
  background: #e9ecef;
}
</style>