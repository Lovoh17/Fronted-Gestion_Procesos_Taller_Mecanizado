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
          :columns="currentColumns"
          :data="currentData"
          :loading="loading"
          @create="(data) => handleCreateTipo(activeTipoTab, data)"
          @update="(data) => handleUpdateTipo(activeTipoTab, data)"
          @delete="(id) => handleDeleteTipo(activeTipoTab, id)"
        />
      </div>

      <!-- Contenido de Alertas -->
      <div v-if="activeTab === 'alertas'" class="alertas-section">
        <ConfigTable
          :columns="columnsAlertas"
          :data="alertas"
          :loading="loading"
          @create="handleCreateAlerta"
          @update="handleUpdateAlerta"
          @delete="handleDeleteAlerta"
        />
      </div>

      <!-- Contenido de Métodos de Pago -->
      <div v-if="activeTab === 'metodos-pago'" class="metodos-pago-section">
        <ConfigTable
          :columns="columnsMetodosPago"
          :data="metodosPago"
          :loading="loading"
          @create="handleCreateMetodoPago"
          @update="handleUpdateMetodoPago"
          @delete="handleDeleteMetodoPago"
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
      tabs: [
        { key: 'tipos', label: 'Tipos' },
        { key: 'alertas', label: 'Alertas' },
        { key: 'metodos-pago', label: 'Métodos de Pago' }
      ],
      
      // Subtabs para tipos
      activeTipoTab: 'herramientas',
      tipoSubtabs: [
        { key: 'herramientas', label: 'Herramientas' },
        { key: 'mantenimiento', label: 'Mantenimiento' },
        { key: 'transaccion', label: 'Transacción' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'unidad-medida', label: 'Unidad Medida' },
        { key: 'turno', label: 'Turnos' }
      ],
      
      // Datos
      tiposHerramientas: [],
      tiposMantenimiento: [],
      tiposTransaccion: [],
      tiposTelefono: [],
      unidadesMedida: [],
      turnos: [],
      alertas: [],
      metodosPago: [],
      
      // Endpoints API
      apiEndpoints: {
        herramientas: 'Tipo_Herramienta',
        mantenimiento: 'Tipo_Mantenimiento',
        transaccion: 'Tipos_Transaccion',
        telefono: 'Tipo_Telefono',
        'unidad-medida': 'Unidad_Medida',
        turno: 'Turno',
        alertas: 'AlertaReparacion',
        'metodos-pago': 'MetodoPago'
      },
      
      // Columnas actualizadas para incluir todos los campos necesarios
      columnsHerramientas: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'caracteristicas_clave', label: 'Características Clave' }
      ],
      columnsMantenimiento: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' }
      ],
      columnsTransaccion: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'afecta_ingresos', label: 'Afecta Ingresos', type: 'boolean' },
        { field: 'afecta_gastos', label: 'Afecta Gastos', type: 'boolean' },
        { field: 'es_interno', label: 'Es Interno', type: 'boolean' }
      ],
      columnsTelefono: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' }
      ],
      columnsUnidadMedida: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'abreviatura', label: 'Abreviatura', required: true },
        { field: 'tipo', label: 'Tipo' }
      ],
      columnsTurnos: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true },
        { field: 'hora_fin', label: 'Hora Fin', type: 'time', required: true },
        { field: 'dias_semana', label: 'Días de la Semana' }
      ],
      columnsAlertas: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'activo', label: 'Activo', type: 'boolean' },
        { field: 'umbral', label: 'Umbral', type: 'number' }
      ],
      columnsMetodosPago: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'requiere_referencia', label: 'Requiere Referencia', type: 'boolean' }
      ]
    }
  },
  created() {
    // Configurar axios si no existe $api
    if (!this.$api) {
      this.api = axios.create({
        baseURL: 'http://localhost:3000/',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          // Agregar token de autenticación si existe
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      })
    } else {
      this.api = this.$api
    }
    
    this.loadAllData()
  },
  computed: {
    // Obtener las columnas correctas según el tipo seleccionado
    currentColumns() {
      switch (this.activeTipoTab) {
        case 'herramientas':
          return this.columnsHerramientas
        case 'mantenimiento':
          return this.columnsMantenimiento
        case 'transaccion':
          return this.columnsTransaccion
        case 'telefono':
          return this.columnsTelefono
        case 'unidad-medida':
          return this.columnsUnidadMedida
        case 'turno':
          return this.columnsTurnos
        default:
          return []
      }
    },
    
    // Obtener los datos actuales según el tipo seleccionado
    currentData() {
      switch (this.activeTipoTab) {
        case 'herramientas':
          return this.tiposHerramientas
        case 'mantenimiento':
          return this.tiposMantenimiento
        case 'transaccion':
          return this.tiposTransaccion
        case 'telefono':
          return this.tiposTelefono
        case 'unidad-medida':
          return this.unidadesMedida
        case 'turno':
          return this.turnos
        default:
          return []
      }
    }
  },
  methods: {
    async loadAllData() {
      this.loading = true
      try {
        const promises = [
          this.api.get(this.apiEndpoints.herramientas),
          this.api.get(this.apiEndpoints.mantenimiento),
          this.api.get(this.apiEndpoints.transaccion),
          this.api.get(this.apiEndpoints.telefono),
          this.api.get(this.apiEndpoints['unidad-medida']),
          this.api.get(this.apiEndpoints.turno),
          this.api.get(this.apiEndpoints.alertas),
          this.api.get(this.apiEndpoints['metodos-pago'])
        ]
        
        const [
          herramientasRes, 
          mantenimientoRes,
          transaccionRes,
          telefonoRes,
          unidadMedidaRes,
          turnoRes,
          alertasRes,
          metodosRes
        ] = await Promise.all(promises)
        
        this.tiposHerramientas = herramientasRes.data || []
        this.tiposMantenimiento = mantenimientoRes.data || []
        this.tiposTransaccion = transaccionRes.data || []
        this.tiposTelefono = telefonoRes.data || []
        this.unidadesMedida = unidadMedidaRes.data || []
        this.turnos = turnoRes.data || []
        this.alertas = alertasRes.data || []
        this.metodosPago = metodosRes.data || []
        
      } catch (error) {
        console.error('Error cargando configuración:', error)
        toast.error('Error al cargar la configuración')
      } finally {
        this.loading = false
      }
    },
    
    // Preparar datos según el tipo antes de enviar
    prepareDataForType(tipo, data) {
      // Crear una copia del objeto para no modificar el original
      const preparedData = { ...data }

      if (!data.id || data.id === 0) {
        delete preparedData.id
      }
      
      switch (tipo) {
        case 'herramientas':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || '',
            caracteristicas_clave: preparedData.caracteristicas_clave || ''
          }
        
        case 'mantenimiento':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || ''
          }
        
        case 'transaccion':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || '',
            afecta_ingresos: Boolean(preparedData.afecta_ingresos),
            afecta_gastos: Boolean(preparedData.afecta_gastos),
            es_interno: Boolean(preparedData.es_interno)
          }
        
        case 'telefono':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || ''
          }
        
        case 'unidad-medida':
          return {
            nombre: preparedData.nombre,
            abreviatura: preparedData.abreviatura,
            tipo: preparedData.tipo || ''
          }
        
        case 'turno':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || '',
            hora_inicio: preparedData.hora_inicio,
            hora_fin: preparedData.hora_fin,
            dias_semana: preparedData.dias_semana || ''
          }
        
        case 'alertas':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || '',
            activo: Boolean(preparedData.activo),
            umbral: parseInt(preparedData.umbral) || 0
          }
        
        case 'metodos-pago':
          return {
            nombre: preparedData.nombre,
            descripcion: preparedData.descripcion || '',
            requiere_referencia: Boolean(preparedData.requiere_referencia)
          }
        
        default:
          return preparedData
      }
    },
    
    // Validar datos antes de enviar
    validateData(tipo, data) {
      const requiredFields = {
        'herramientas': ['nombre'],
        'mantenimiento': ['nombre'],
        'transaccion': ['nombre'],
        'telefono': ['nombre'],
        'unidad-medida': ['nombre', 'abreviatura'],
        'turno': ['nombre', 'hora_inicio', 'hora_fin'],
        'alertas': ['nombre'],
        'metodos-pago': ['nombre']
      }
      
      const required = requiredFields[tipo] || ['nombre']
      
      for (const field of required) {
        if (!data[field] || data[field].toString().trim() === '') {
          throw new Error(`El campo ${field} es requerido`)
        }
      }
      return true
    },
    
    // Métodos para Tipos (CRUD completo)
    async handleCreateTipo(tipo, data) {
      try {
        this.validateData(tipo, data)
        const preparedData = this.prepareDataForType(tipo, data)
        
        const endpoint = this.apiEndpoints[tipo]
        const response = await this.api.post(endpoint, preparedData)
        
        toast.success('Tipo creado correctamente')
        await this.loadDataForType(tipo)
        
        return response
      } catch (error) {
        console.error('Error creando tipo:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear tipo'
        toast.error(errorMessage)
        throw error
      }
    },
    
    async handleUpdateTipo(tipo, data) {
      try {
        this.validateData(tipo, data)
        const preparedData = this.prepareDataForType(tipo, data)
        
        const endpoint = `${this.apiEndpoints[tipo]}/${data.id}`
        const response = await this.api.put(endpoint, preparedData)
        
        toast.success('Tipo actualizado correctamente')
        await this.loadDataForType(tipo)
        
        return response
      } catch (error) {
        console.error('Error actualizando tipo:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar tipo'
        toast.error(errorMessage)
        throw error
      }
    },
    
    async handleDeleteTipo(tipo, id) {
      try {
        if (!confirm('¿Estás seguro de que deseas eliminar este tipo?')) {
          return
        }
        
        const endpoint = `${this.apiEndpoints[tipo]}/${id}`
        await this.api.delete(endpoint)
        
        toast.success('Tipo eliminado correctamente')
        await this.loadDataForType(tipo)
      } catch (error) {
        console.error('Error eliminando tipo:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar tipo'
        toast.error(errorMessage)
        throw error
      }
    },
    
    // Cargar datos específicos por tipo
    async loadDataForType(tipo) {
      try {
        const response = await this.api.get(this.apiEndpoints[tipo])
        
        switch (tipo) {
          case 'herramientas':
            this.tiposHerramientas = response.data || []
            break
          case 'mantenimiento':
            this.tiposMantenimiento = response.data || []
            break
          case 'transaccion':
            this.tiposTransaccion = response.data || []
            break
          case 'telefono':
            this.tiposTelefono = response.data || []
            break
          case 'unidad-medida':
            this.unidadesMedida = response.data || []
            break
          case 'turno':
            this.turnos = response.data || []
            break
          case 'alertas':
            this.alertas = response.data || []
            break
          case 'metodos-pago':
            this.metodosPago = response.data || []
            break
        }
      } catch (error) {
        console.error(`Error cargando datos para ${tipo}:`, error)
      }
    },
    
    // Métodos para Alertas
    async handleCreateAlerta(data) {
      try {
        this.validateData('alertas', data)
        const preparedData = this.prepareDataForType('alertas', data)
        
        await this.api.post(this.apiEndpoints.alertas, preparedData)
        toast.success('Alerta creada correctamente')
        await this.loadDataForType('alertas')
      } catch (error) {
        console.error('Error creando alerta:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear alerta'
        toast.error(errorMessage)
      }
    },
    
    async handleUpdateAlerta(data) {
      try {
        this.validateData('alertas', data)
        const preparedData = this.prepareDataForType('alertas', data)
        
        await this.api.put(`${this.apiEndpoints.alertas}/${data.id}`, preparedData)
        toast.success('Alerta actualizada correctamente')
        await this.loadDataForType('alertas')
      } catch (error) {
        console.error('Error actualizando alerta:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar alerta'
        toast.error(errorMessage)
      }
    },
    
    async handleDeleteAlerta(id) {
      try {
        if (!confirm('¿Estás seguro de que deseas eliminar esta alerta?')) {
          return
        }
        
        await this.api.delete(`${this.apiEndpoints.alertas}/${id}`)
        toast.success('Alerta eliminada correctamente')
        await this.loadDataForType('alertas')
      } catch (error) {
        console.error('Error eliminando alerta:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar alerta'
        toast.error(errorMessage)
      }
    },
    
    // Métodos para Métodos de Pago
    async handleCreateMetodoPago(data) {
      try {
        this.validateData('metodos-pago', data)
        const preparedData = this.prepareDataForType('metodos-pago', data)
        
        await this.api.post(this.apiEndpoints['metodos-pago'], preparedData)
        toast.success('Método de pago creado correctamente')
        await this.loadDataForType('metodos-pago')
      } catch (error) {
        console.error('Error creando método de pago:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear método de pago'
        toast.error(errorMessage)
      }
    },
    
    async handleUpdateMetodoPago(data) {
      try {
        this.validateData('metodos-pago', data)
        const preparedData = this.prepareDataForType('metodos-pago', data)
        
        await this.api.put(`${this.apiEndpoints['metodos-pago']}/${data.id}`, preparedData)
        toast.success('Método de pago actualizado correctamente')
        await this.loadDataForType('metodos-pago')
      } catch (error) {
        console.error('Error actualizando método de pago:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar método de pago'
        toast.error(errorMessage)
      }
    },
    
    async handleDeleteMetodoPago(id) {
      try {
        if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
          return
        }
        
        await this.api.delete(`${this.apiEndpoints['metodos-pago']}/${id}`)
        toast.success('Método de pago eliminado correctamente')
        await this.loadDataForType('metodos-pago')
      } catch (error) {
        console.error('Error eliminando método de pago:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar método de pago'
        toast.error(errorMessage)
      }
    }
  }
}
</script>

<style scoped>
.configuracion-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.container h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 600;
}

.main-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 16px;
}

.tab-button:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background-color: #fff;
}

.sub-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.subtab-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.subtab-button:hover {
  background: #e9ecef;
  color: #495057;
}

.subtab-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tipos-section,
.alertas-section,
.metodos-pago-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .configuracion-view {
    padding: 10px;
  }
  
  .main-tabs {
    flex-direction: column;
    gap: 5px;
  }
  
  .tab-button {
    text-align: left;
    padding: 10px 15px;
  }
  
  .sub-tabs {
    flex-direction: column;
    gap: 5px;
  }
  
  .container h1 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .tipos-section,
  .alertas-section,
  .metodos-pago-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .configuracion-view {
    padding: 5px;
  }
  
  .container h1 {
    font-size: 1.3rem;
  }
  
  .tipos-section,
  .alertas-section,
  .metodos-pago-section {
    padding: 10px;
  }
}
</style>