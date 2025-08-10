<template>
  <div class="crud-table">
    <div class="table-header">
      <va-button @click="showAddForm = !showAddForm" class="btn-add"   >
        {{ showAddForm ? 'Cancelar' : '➕ Agregar Nuevo' }}
      </va-button>
    </div>

    <!-- Formulario para agregar nuevo -->
    <div v-if="showAddForm" class="add-form">
      <h4>Agregar Nuevo</h4>
      <div class="form-grid">
        <div v-for="col in editableColumns" :key="col.field" class="form-field">
          <label>{{ col.label }}{{ col.required ? ' *' : '' }}</label>
          
          <!-- Campo booleano -->
          <div v-if="col.type === 'boolean'" class="checkbox-container">
            <input
              type="checkbox"
              :id="`new-${col.field}`"
              v-model="newItem[col.field]"
            >
            <label :for="`new-${col.field}`" class="checkbox-label">
              {{ newItem[col.field] ? 'Sí' : 'No' }}
            </label>
          </div>
          
          <!-- Otros campos -->
          <input
            v-else-if="col.type === 'number'"
            type="number"
            v-model.number="newItem[col.field]"
            :required="col.required"
          >
          <input
            v-else-if="col.type === 'time'"
            type="time"
            v-model="newItem[col.field]"
            :required="col.required"
          >
          <input
            v-else-if="col.type === 'color'"
            type="color"
            v-model="newItem[col.field]"
            :required="col.required"
          >
          <input
            v-else
            type="text"
            v-model="newItem[col.field]"
            :required="col.required"
          >
        </div>
      </div>
      <div class="form-actions">
        <va-button @click="addItem" class="btn-save"   >
        Guardar
      </va-button>
        <va-button @click="cancelAdd" class="btn-cancel"   >
        Cancelar
      </va-button>
      </div>
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.field">{{ col.label }}</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + 1" class="loading-row">
              Cargando...
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length + 1" class="empty-row">
              No hay datos disponibles
            </td>
          </tr>
          <tr v-else v-for="item in data" :key="item.id">
            <td v-for="col in columns" :key="col.field">
              <template v-if="editingItem?.id === item.id">
                <!-- Campos de edición -->
                
                <!-- Campo booleano en edición -->
                <div v-if="col.type === 'boolean'" class="checkbox-container">
                  <input
                    type="checkbox"
                    :id="`edit-${col.field}-${item.id}`"
                    v-model="editingItem[col.field]"
                    :disabled="col.readonly"
                  >
                  <label :for="`edit-${col.field}-${item.id}`" class="checkbox-label">
                    {{ editingItem[col.field] ? 'Sí' : 'No' }}
                  </label>
                </div>
                
                <!-- Otros campos en edición -->
                <input
                  v-else-if="col.type === 'number'"
                  type="number"
                  v-model.number="editingItem[col.field]"
                  :disabled="col.readonly"
                  :required="col.required"
                >
                <input
                  v-else-if="col.type === 'time'"
                  type="time"
                  v-model="editingItem[col.field]"
                  :disabled="col.readonly"
                  :required="col.required"
                >
                <input
                  v-else-if="col.type === 'color'"
                  type="color"
                  v-model="editingItem[col.field]"
                  :disabled="col.readonly"
                  :required="col.required"
                >
                <input
                  v-else
                  type="text"
                  v-model="editingItem[col.field]"
                  :disabled="col.readonly"
                  :required="col.required"
                >
              </template>
              <template v-else>
                <!-- Visualización normal -->
                <span v-if="col.type === 'boolean'" class="boolean-display">
                  <span :class="['boolean-badge', { 'true': item[col.field], 'false': !item[col.field] }]">
                    {{ item[col.field] ? 'Sí' : 'No' }}
                  </span>
                </span>
                <span v-else-if="col.type === 'color'" class="color-display">
                  <span class="color-box" :style="{backgroundColor: item[col.field]}"></span>
                  {{ item[col.field] }}
                </span>
                <span v-else>
                  {{ formatValue(item[col.field], col.type) }}
                </span>
              </template>
            </td>
            <td class="actions">
              <template v-if="editingItem?.id === item.id">
                <va-button @click="saveItem" class="btn-save"   >
        💾
      </va-button>
                <va-button @click="cancelEdit" class="btn-cancel"   >
        ✖
      </va-button>
              </template>
              <template v-else>
                <va-button @click="startEdit(item)" class="btn-edit"   >
        ✏️
      </va-button>
                <va-button @click="deleteItem(item)" class="btn-delete"   >
        🗑️
      </va-button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfigTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editingItem: null,
      newItem: {},
      showAddForm: false
    }
  },
  computed: {
    editableColumns() {
      return this.columns.filter(col => !col.readonly)
    }
  },
  watch: {
    showAddForm(newVal) {
      if (newVal) {
        this.initializeNewItem()
      }
    }
  },
  methods: {
    // Inicializar nuevo item con valores por defecto
    initializeNewItem() {
      this.newItem = {}
      this.columns.forEach(col => {
        if (col.type === 'boolean') {
          this.newItem[col.field] = false
        } else if (col.type === 'number') {
          this.newItem[col.field] = 0
        } else {
          this.newItem[col.field] = ''
        }
      })
    },
    
    startEdit(item) {
      this.editingItem = { ...item }
      // Asegurar que los campos booleanos sean booleanos
      this.columns.forEach(col => {
        if (col.type === 'boolean') {
          this.editingItem[col.field] = Boolean(this.editingItem[col.field])
        }
      })
    },
    
    cancelEdit() {
      this.editingItem = null
    },
    
    async saveItem() {
      try {
        // Validar campos requeridos
        const requiredFields = this.columns.filter(col => col.required).map(col => col.field)
        for (const field of requiredFields) {
          const value = this.editingItem[field]
          if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            throw new Error(`El campo ${this.columns.find(c => c.field === field)?.label} es requerido`)
          }
        }

        this.$emit('update', this.editingItem)
        this.editingItem = null
      } catch (error) {
        console.error('Error en saveItem:', error)
        alert(error.message)
      }
    },
    
    cancelAdd() {
      this.newItem = {}
      this.showAddForm = false
    },
    
    async addItem() {
      try {
        // Validar campos requeridos
        const requiredFields = this.columns.filter(col => col.required && !col.readonly).map(col => col.field)
        for (const field of requiredFields) {
          const value = this.newItem[field]
          if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            throw new Error(`El campo ${this.columns.find(c => c.field === field)?.label} es requerido`)
          }
        }

        this.$emit('create', { ...this.newItem })
        this.newItem = {}
        this.showAddForm = false
      } catch (error) {
        console.error('Error en addItem:', error)
        alert(error.message)
      }
    },
    
    async deleteItem(item) {
      const itemName = item.nombre || item.descripcion || `ID: ${item.id}`
      if (confirm(`¿Estás seguro de que deseas eliminar "${itemName}"?`)) {
        this.$emit('delete', item.id)
      }
    },
    
    formatValue(value, type) {
      if (value === null || value === undefined) return '-'
      
      switch (type) {
        case 'number':
          return typeof value === 'number' ? value.toLocaleString() : value
        case 'time':
          return value
        case 'boolean':
          return value ? 'Sí' : 'No'
        default:
          return value
      }
    }
  }
}
</script>

<style scoped>
.crud-table {
  margin-top: 15px;
}

.table-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.btn-add {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover {
  background: #369870;
}

.add-form {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.add-form h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-field label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-field input[type="text"],
.form-field input[type="number"],
.form-field input[type="time"],
.form-field input[type="color"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-container input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox-label {
  margin: 0 !important;
  font-weight: normal !important;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  background: #369870;
}

.btn-cancel {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #c82333;
}

.table-responsive {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.loading-row, .empty-row {
  text-align: center;
  padding: 30px;
  color: #666;
  font-style: italic;
}

.boolean-display {
  display: flex;
  align-items: center;
}

.boolean-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.boolean-badge.true {
  background: #d4edda;
  color: #155724;
}

.boolean-badge.false {
  background: #f8d7da;
  color: #721c24;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.actions {
  white-space: nowrap;
  text-align: center;
}

.actions button {
  margin: 0 3px;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-delete:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .table-responsive {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
  
  .actions button {
    padding: 3px 6px;
    font-size: 12px;
  }
}
</style>