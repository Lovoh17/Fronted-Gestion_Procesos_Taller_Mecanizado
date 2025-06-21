<template>
  <div class="configuracion-container">
    <h1>Configuración del Sistema</h1>
    
    <div class="config-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="{active: activeTab === tab.key}"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="config-content">
      <!-- Sección de Tipos -->
      <div v-if="activeTab === 'tipos'" class="config-section">
        <div class="sub-tabs">
          <button
            v-for="subTab in tipoSubtabs"
            :key="subTab.key"
            @click="activeTipoTab = subTab.key"
            :class="{active: activeTipoTab === subTab.key}"
          >
            {{ subTab.label }}
          </button>
        </div>

        <!-- Tipos de Herramientas -->
        <div v-if="activeTipoTab === 'herramientas'" class="type-section">
          <h3>Tipos de Herramientas</h3>
          <ConfigTable
            :columns="columnsTipos"
            :data="tiposHerramientas"
            :loading="loading"
            @create="handleCreateTipo('herramientas', $event)"
            @update="handleUpdateTipo('herramientas', $event)"
            @delete="handleDeleteTipo('herramientas', $event)"
          />
        </div>

        <!-- Tipos de Mantenimiento -->
        <div v-if="activeTipoTab === 'mantenimiento'" class="type-section">
          <h3>Tipos de Mantenimiento</h3>
          <ConfigTable
            :columns="columnsTipos"
            :data="tiposMantenimiento"
            :loading="loading"
            @create="handleCreateTipo('mantenimiento', $event)"
            @update="handleUpdateTipo('mantenimiento', $event)"
            @delete="handleDeleteTipo('mantenimiento', $event)"
          />
        </div>

        <!-- Tipos de Transacción -->
        <div v-if="activeTipoTab === 'transaccion'" class="type-section">
          <h3>Tipos de Transacción</h3>
          <ConfigTable
            :columns="columnsTipos"
            :data="tiposTransaccion"
            :loading="loading"
            @create="handleCreateTipo('transaccion', $event)"
            @update="handleUpdateTipo('transaccion', $event)"
            @delete="handleDeleteTipo('transaccion', $event)"
          />
        </div>

        <!-- Tipos de Teléfono -->
        <div v-if="activeTipoTab === 'telefono'" class="type-section">
          <h3>Tipos de Teléfono</h3>
          <ConfigTable
            :columns="columnsTipos"
            :data="tiposTelefono"
            :loading="loading"
            @create="handleCreateTipo('telefono', $event)"
            @update="handleUpdateTipo('telefono', $event)"
            @delete="handleDeleteTipo('telefono', $event)"
          />
        </div>

        <!-- Unidades de Medida -->
        <div v-if="activeTipoTab === 'unidad-medida'" class="type-section">
          <h3>Unidades de Medida</h3>
          <ConfigTable
            :columns="columnsUnidadMedida"
            :data="unidadesMedida"
            :loading="loading"
            @create="handleCreateTipo('unidad-medida', $event)"
            @update="handleUpdateTipo('unidad-medida', $event)"
            @delete="handleDeleteTipo('unidad-medida', $event)"
          />
        </div>

        <!-- Turnos -->
        <div v-if="activeTipoTab === 'turno'" class="type-section">
          <h3>Turnos</h3>
          <ConfigTable
            :columns="columnsTurnos"
            :data="turnos"
            :loading="loading"
            @create="handleCreateTipo('turno', $event)"
            @update="handleUpdateTipo('turno', $event)"
            @delete="handleDeleteTipo('turno', $event)"
          />
        </div>
      </div>

      <!-- Sección de Alertas -->
      <div v-if="activeTab === 'alertas'" class="config-section">
        <h2>Configuración de Alertas</h2>
        <div class="alertas-grid" v-if="!loading">
          <div v-for="alerta in alertas" :key="alerta.id" class="alerta-card">
            <h3>{{ alerta.nombre }}</h3>
            <div class="alerta-controls">
              <label>
                <input 
                  type="checkbox" 
                  v-model="alerta.activo"
                  @change="saveAlerta(alerta)"
                > Activo
              </label>
              <input 
                v-model.number="alerta.umbral" 
                type="number" 
                placeholder="Umbral"
                :disabled="!alerta.activo"
                @blur="saveAlerta(alerta)"
                min="0"
              >
              <button 
                @click="saveAlerta(alerta)"
                :disabled="loading"
                class="btn-save"
              >
                {{ loading ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="loading">Cargando alertas...</div>
      </div>

      <!-- Sección de Métodos de Pago -->
      <div v-if="activeTab === 'metodos-pago'" class="config-section">
        <h2>Métodos de Pago</h2>
        <ConfigTable
          :columns="columnsMetodosPago"
          :data="metodosPago"
          :loading="loading"
          @create="handleCreateMetodoPago($event)"
          @update="handleUpdateMetodoPago($event)"
          @delete="handleDeleteMetodoPago($event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ConfigTable from '@/components/GlobalComponents/ConfigTable.vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import axios from 'axios' // Importar axios directamente

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
      
      // Columnas para tablas
      columnsTipos: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'activo', label: 'Activo', type: 'checkbox' }
      ],
      columnsMetodosPago: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'comision', label: 'Comisión (%)', type: 'number' },
        { field: 'activo', label: 'Activo', type: 'checkbox' }
      ],
      columnsUnidadMedida: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'simbolo', label: 'Símbolo', required: true },
        { field: 'descripcion', label: 'Descripción' },
        { field: 'activo', label: 'Activo', type: 'checkbox' }
      ],
      columnsTurnos: [
        { field: 'id', label: 'ID', readonly: true },
        { field: 'nombre', label: 'Nombre', required: true },
        { field: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true },
        { field: 'hora_fin', label: 'Hora Fin', type: 'time', required: true },
        { field: 'activo', label: 'Activo', type: 'checkbox' }
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
  methods: {
    async loadAllData() {
      this.loading = true
      try {
        // Cargar todos los datos necesarios (sin estados)
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
    
    // Validar datos antes de enviar
    validateData(data, required = []) {
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
        this.validateData(data, ['nombre'])
        
        const endpoint = this.apiEndpoints[tipo]
        const response = await this.api.post(endpoint, data)
        
        toast.success('Tipo creado correctamente')
        await this.loadDataForType(tipo)
        
        return response
      } catch (error) {
        console.error('Error creando tipo:', error)
        toast.error(error.message || 'Error al crear tipo')
        throw error
      }
    },
    
    async handleUpdateTipo(tipo, data) {
      try {
        this.validateData(data, ['nombre'])
        
        const endpoint = `${this.apiEndpoints[tipo]}/${data.id}`
        const response = await this.api.put(endpoint, data)
        
        toast.success('Tipo actualizado correctamente')
        await this.loadDataForType(tipo)
        
        return response
      } catch (error) {
        console.error('Error actualizando tipo:', error)
        toast.error(error.message || 'Error al actualizar tipo')
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
        toast.error(error.message || 'Error al eliminar tipo')
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
        }
      } catch (error) {
        console.error(`Error cargando datos para ${tipo}:`, error)
      }
    },
    
    // Métodos para Alertas
    async saveAlerta(alerta) {
      try {
        this.loading = true
        
        await this.api.put(`${this.apiEndpoints.alertas}/${alerta.id}`, {
          activo: alerta.activo,
          umbral: alerta.umbral || 0
        })
        
        toast.success('Configuración de alerta guardada')
      } catch (error) {
        console.error('Error guardando alerta:', error)
        toast.error('Error al guardar alerta')
      } finally {
        this.loading = false
      }
    },
    
    // Métodos para Métodos de Pago
    async handleCreateMetodoPago(data) {
      try {
        this.validateData(data, ['nombre'])
        
        await this.api.post(this.apiEndpoints['metodos-pago'], data)
        toast.success('Método de pago creado')
        await this.loadAllData()
      } catch (error) {
        console.error('Error creando método de pago:', error)
        toast.error(error.message || 'Error al crear método de pago')
      }
    },
    
    async handleUpdateMetodoPago(data) {
      try {
        this.validateData(data, ['nombre'])
        
        await this.api.put(`${this.apiEndpoints['metodos-pago']}/${data.id}`, data)
        toast.success('Método de pago actualizado')
        await this.loadAllData()
      } catch (error) {
        console.error('Error actualizando método de pago:', error)
        toast.error(error.message || 'Error al actualizar método de pago')
      }
    },
    
    async handleDeleteMetodoPago(id) {
      try {
        if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
          return
        }
        
        await this.api.delete(`${this.apiEndpoints['metodos-pago']}/${id}`)
        toast.success('Método de pago eliminado')
        await this.loadAllData()
      } catch (error) {
        console.error('Error eliminando método de pago:', error)
        toast.error('Error al eliminar método de pago')
      }
    }
  }
}
</script>

<style scoped>
.configuracion-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.config-tabs button {
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.config-tabs button:hover {
  background: #f0f0f0;
}

.config-tabs button.active {
  background: #42b983;
  color: white;
}

.config-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.sub-tabs button {
  padding: 6px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.sub-tabs button:hover {
  background: #e0e0e0;
}

.sub-tabs button.active {
  background: #42b983;
  color: white;
}

.type-section {
  margin-top: 15px;
}

.alertas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.alerta-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.alerta-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.alerta-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.alerta-controls label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.alerta-controls input[type="number"] {
  width: 80px;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-save {
  padding: 5px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
}

.btn-save:hover:not(:disabled) {
  background: #369870;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.config-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.config-section h3 {
  margin-bottom: 15px;
  color: #555;
}

/* Responsive */
@media (max-width: 768px) {
  .configuracion-container {
    padding: 10px;
  }
  
  .config-tabs {
    flex-wrap: wrap;
  }
  
  .config-content {
    padding: 15px;
  }
  
  .alertas-grid {
    grid-template-columns: 1fr;
  }
  
  .alerta-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .alerta-controls input[type="number"] {
    width: 100%;
  }
}
</style>