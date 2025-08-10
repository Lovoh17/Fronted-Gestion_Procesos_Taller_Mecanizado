<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ editing ? 'Editar' : 'Agregar' }} Materia Prima</h3>
        <va-button @click="$emit('close')" class="btn-icon"    >
        
          <span class="material-icons">close</span>
        
      </va-button>
      </div>
      
      <form @submit.prevent="submitForm" class="modal-form">
        <div class="form-group">
          <label>Código *</label>
          <input 
            v-model="form.codigo" 
            type="text" 
            required
            :disabled="editing"
            placeholder="Ej: MP001"
          >
          <small v-if="errors.codigo" class="error-text">{{ errors.codigo }}</small>
        </div>
        
        <div class="form-group">
          <label>Nombre *</label>
          <input 
            v-model="form.nombre" 
            type="text" 
            required
            placeholder="Nombre de la materia prima"
          >
          <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
        </div>
        
        <div class="form-group">
          <label>Descripción</label>
          <textarea 
            v-model="form.descripcion"
            placeholder="Descripción detallada (opcional)"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Materia Prima *</label>
            <select v-model="form.tipo_materia_prima_id" required>
              <option value="">Seleccionar tipo</option>
              <option 
                v-for="tipo in tiposMateriaPrima" 
                :key="tipo.id" 
                :value="tipo.id"
              >
                {{ tipo.nombre }}
              </option>
            </select>
            <small v-if="errors.tipo_materia_prima_id" class="error-text">{{ errors.tipo_materia_prima_id }}</small>
          </div>
          
          <div class="form-group">
            <label>Unidad Base *</label>
            <select v-model="form.unidad_base_id" required>
              <option value="">Seleccionar unidad</option>
              <option 
                v-for="unidad in unidades" 
                :key="unidad.id" 
                :value="unidad.id"
              >
                {{ unidad.nombre }} ({{ unidad.abreviacion }})
              </option>
            </select>
            <small v-if="errors.unidad_base_id" class="error-text">{{ errors.unidad_base_id }}</small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Stock Mínimo *</label>
            <input 
              v-model.number="form.stock_minimo" 
              type="number" 
              min="0" 
              step="0.01"
              required
            >
            <small v-if="errors.stock_minimo" class="error-text">{{ errors.stock_minimo }}</small>
          </div>
          
          <div class="form-group">
            <label>Stock Máximo *</label>
            <input 
              v-model.number="form.stock_maximo" 
              type="number" 
              min="0" 
              step="0.01"
              required
            >
            <small v-if="errors.stock_maximo" class="error-text">{{ errors.stock_maximo }}</small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Unidades Completas</label>
            <input 
              v-model.number="form.unidades_completas" 
              type="number" 
              min="0" 
              step="1"
            >
          </div>
          
          <div class="form-group">
            <label>Fracciones</label>
            <input 
              v-model.number="form.fracciones" 
              type="number" 
              min="0" 
              step="0.01"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Stock Total</label>
          <input 
            v-model.number="form.stock_total" 
            type="number" 
            min="0" 
            step="0.01"
            readonly
            class="readonly-input"
          >
          <small class="help-text">Se calcula automáticamente</small>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Costo Unitario *</label>
            <div class="input-group">
              <span class="input-prefix">$</span>
              <input 
                v-model.number="form.costo_unitario" 
                type="number" 
                min="0" 
                step="0.01"
                required
              >
            </div>
            <small v-if="errors.costo_unitario" class="error-text">{{ errors.costo_unitario }}</small>
          </div>
          
          <div class="form-group">
            <label>Tiempo de Reposición (días)</label>
            <input 
              v-model.number="form.tiempo_reposicion" 
              type="number" 
              min="0" 
              step="1"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Proveedor Principal</label>
          <input 
            v-model="form.proveedor_principal" 
            type="text"
            placeholder="Nombre del proveedor principal"
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Unidad de Fracción</label>
            <select v-model="form.fraccion_unidad_id">
              <option value="">Sin fracción</option>
              <option 
                v-for="unidad in unidades" 
                :key="unidad.id" 
                :value="unidad.id"
              >
                {{ unidad.nombre }} ({{ unidad.abreviacion }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Stock Padre</label>
            <select v-model="form.pertenece_a_stock_id">
              <option value="">Independiente</option>
              <option 
                v-for="mp in materiaPrimaPadre" 
                :key="mp.id" 
                :value="mp.id"
              >
                {{ mp.nombre }} ({{ mp.codigo }})
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-checkboxes">
          <div class="checkbox-group">
            <input 
              type="checkbox" 
              id="permite_fraccion" 
              v-model="form.permite_fraccion"
            >
            <label for="permite_fraccion">Permite fraccionamiento</label>
          </div>
          
          <div class="checkbox-group">
            <input 
              type="checkbox" 
              id="es_controlado" 
              v-model="form.es_controlado"
            >
            <label for="es_controlado">Es material controlado</label>
          </div>
        </div>
        
        <div class="form-actions">
          <va-button type="button" @click="$emit('close')" class="btn btn-outline"   preset="outline">
        Cancelar
      </va-button>
          <va-button type="submit" class="btn btn-primary" :disabled="loading" color="primary"  >
        {{ loading ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar') }}
      </va-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AddMateriaPrima',
  props: {
    editing: {
      type: Boolean,
      default: false
    },
    materiaPrimaToEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      tiposMateriaPrima: [],
      unidades: [],
      materiaPrimaPadre: [],
      errors: {},
      form: {
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo_materia_prima_id: '',
        unidad_base_id: '',
        stock_minimo: 0,
        stock_maximo: 0,
        unidades_completas: 0,
        fracciones: 0,
        stock_total: 0,
        fraccion_unidad_id: '',
        permite_fraccion: false,
        pertenece_a_stock_id: '',
        costo_unitario: 0,
        proveedor_principal: '',
        tiempo_reposicion: 0,
        es_controlado: false
      }
    }
  },
  watch: {
    'form.unidades_completas'() {
      this.calculateStockTotal()
    },
    'form.fracciones'() {
      this.calculateStockTotal()
    },
    'form.stock_maximo'() {
      this.validateStockLimits()
    },
    'form.stock_minimo'() {
      this.validateStockLimits()
    }
  },
  async created() {
    await this.loadCatalogs()
    if (this.editing && this.materiaPrimaToEdit) {
      this.loadFormData()
    }
  },
  methods: {
    async loadCatalogs() {
      try {
        const [tiposResponse, unidadesResponse, materiaPrimaResponse] = await Promise.all([
          axios.get('/TipoMateriaPrima'),
          axios.get('/UnidadMedida'),
          axios.get('/MateriaPrima')
        ])
        
        this.tiposMateriaPrima = tiposResponse.data
        this.unidades = unidadesResponse.data
        this.materiaPrimaPadre = materiaPrimaResponse.data
      } catch (error) {
        console.error('Error loading catalogs:', error)
        this.showError('Error al cargar los catálogos')
      }
    },
    
    loadFormData() {
      const data = this.materiaPrimaToEdit
      this.form = {
        codigo: data.codigo || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        tipo_materia_prima_id: data.tipo_materia_prima_id || '',
        unidad_base_id: data.unidad_base_id || '',
        stock_minimo: data.stock_minimo || 0,
        stock_maximo: data.stock_maximo || 0,
        unidades_completas: data.unidades_completas || 0,
        fracciones: data.fracciones || 0,
        stock_total: data.stock_total || 0,
        fraccion_unidad_id: data.fraccion_unidad_id || '',
        permite_fraccion: data.permite_fraccion || false,
        pertenece_a_stock_id: data.pertenece_a_stock_id || '',
        costo_unitario: data.costo_unitario || 0,
        proveedor_principal: data.proveedor_principal || '',
        tiempo_reposicion: data.tiempo_reposicion || 0,
        es_controlado: data.es_controlado || false
      }
    },
    
    calculateStockTotal() {
      this.form.stock_total = (this.form.unidades_completas || 0) + (this.form.fracciones || 0)
    },
    
    validateStockLimits() {
      this.errors = { ...this.errors }
      
      if (this.form.stock_maximo && this.form.stock_minimo && 
          this.form.stock_maximo <= this.form.stock_minimo) {
        this.errors.stock_maximo = 'El stock máximo debe ser mayor al stock mínimo'
      } else {
        delete this.errors.stock_maximo
      }
    },
    
    validateForm() {
      this.errors = {}
      
      // Validaciones básicas
      if (!this.form.codigo.trim()) {
        this.errors.codigo = 'El código es requerido'
      }
      
      if (!this.form.nombre.trim()) {
        this.errors.nombre = 'El nombre es requerido'
      }
      
      if (!this.form.tipo_materia_prima_id) {
        this.errors.tipo_materia_prima_id = 'El tipo de materia prima es requerido'
      }
      
      if (!this.form.unidad_base_id) {
        this.errors.unidad_base_id = 'La unidad base es requerida'
      }
      
      if (this.form.stock_minimo < 0) {
        this.errors.stock_minimo = 'El stock mínimo no puede ser negativo'
      }
      
      if (this.form.stock_maximo < 0) {
        this.errors.stock_maximo = 'El stock máximo no puede ser negativo'
      }
      
      if (this.form.costo_unitario < 0) {
        this.errors.costo_unitario = 'El costo unitario no puede ser negativo'
      }
      
      // Validar que stock máximo > stock mínimo
      if (this.form.stock_maximo && this.form.stock_minimo && 
          this.form.stock_maximo <= this.form.stock_minimo) {
        this.errors.stock_maximo = 'El stock máximo debe ser mayor al stock mínimo'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async submitForm() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      try {
        let response
        
        if (this.editing) {
          response = await axios.put(`/MateriaPrima/${this.materiaPrimaToEdit.id}`, this.form)
          this.$emit('updated', response.data)
        } else {
          response = await axios.post('/MateriaPrima', this.form)
          this.$emit('created', response.data)
        }
        
      } catch (error) {
        console.error('Error saving materia prima:', error)
        
        if (error.response?.status === 400) {
          // Manejar errores de validación del servidor
          const serverErrors = error.response.data
          if (serverErrors.camposFaltantes) {
            serverErrors.camposFaltantes.forEach(campo => {
              this.errors[campo] = `${campo} es requerido`
            })
          }
          if (serverErrors.error) {
            this.showError(serverErrors.error)
          }
        } else {
          this.showError('Error al guardar la materia prima')
        }
      } finally {
        this.loading = false
      }
    },
    
    showError(message) {
      // Implementar notificación de error
      alert(message) // Temporal - reemplazar con sistema de notificaciones
    }
  }
}
</script>

<style scoped>
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
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f8f9fa;
}

.material-icons {
  font-size: 18px;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.readonly-input {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 12px;
  color: #666;
  font-weight: 500;
  z-index: 1;
}

.input-group input {
  padding-left: 24px;
}

.form-checkboxes {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-group label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.help-text {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover {
  background-color: #6c757d;
  color: white;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-checkboxes {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}
</style>