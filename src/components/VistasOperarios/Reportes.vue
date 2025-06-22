
<template>
  <div class="reportar-problema-container">
    <!-- Encabezado -->
    <div class="header">
      <h2>Reportar Problema</h2>
      <p>Complete el formulario para generar una alerta de mantenimiento</p>
    </div>

    <!-- Estado de carga/error -->
    <div v-if="loading" class="status-message loading">Cargando datos...</div>
    <div v-if="error" class="status-message error">{{ error }}</div>
    <div v-if="submitSuccess" class="status-message success">
      ¡Alerta creada exitosamente!
      <button @click="resetForm" class="btn small">Crear otra alerta</button>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="submitForm" v-if="!submitSuccess && !loading" class="problema-form">
      <!-- Selector de herramienta con búsqueda -->
      <div class="form-group">
        <label>Herramienta:</label>
        <div class="search-select">
          <input
            type="text"
            v-model="herramientaSearch"
            @input="searchHerramientas"
            placeholder="Buscar herramienta..."
          />
          <select
            v-model="formData.herramienta_id"
            @change="selectHerramienta"
            required
            size="5"
            v-show="showHerramientasList"
          >
            <option 
              v-for="herramienta in herramientasFiltradas" 
              :key="herramienta.id" 
              :value="herramienta.id"
            >
              {{ herramienta.nombre }} ({{ herramienta.codigo }})
            </option>
          </select>
          <div v-if="selectedHerramienta" class="selected-item">
            Seleccionado: <strong>{{ selectedHerramienta.nombre }}</strong>
          </div>
        </div>
      </div>

      <!-- Resto del formulario -->
      <div class="form-group" :class="{ 'has-error': errors.tipo_alerta_id }">
        <label>Tipo de Alerta:</label>
        <select v-model="formData.tipo_alerta_id" required>
          <option value="">Seleccione un tipo</option>
          <option 
            v-for="tipo in tiposAlerta" 
            :key="tipo.id" 
            :value="tipo.id"
          >
            {{ tipo.nombre }}
          </option>
        </select>
        <span class="error-message" v-if="errors.tipo_alerta_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.prioridad_id }">
        <label>Prioridad:</label>
        <select v-model="formData.prioridad_id" required>
          <option value="">Seleccione prioridad</option>
          <option 
            v-for="prioridad in prioridades" 
            :key="prioridad.id" 
            :value="prioridad.id"
          >
            {{ prioridad.nombre }}
          </option>
        </select>
        <span class="error-message" v-if="errors.prioridad_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.fecha_limite }">
        <label>Fecha Límite:</label>
        <input 
          type="date" 
          v-model="formData.fecha_limite" 
          required
          :min="minDate"
        />
        <span class="error-message" v-if="errors.fecha_limite">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.descripcion }">
        <label>Descripción del Problema:</label>
        <textarea 
          v-model="formData.descripcion" 
          required
          placeholder="Describa el problema con detalle..."
        ></textarea>
        <span class="error-message" v-if="errors.descripcion">
          Este campo es requerido
        </span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn primary" :disabled="submitting">
          {{ submitting ? 'Enviando...' : 'Reportar Problema' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ReportarProblema',
  data() {
    return {
      formData: {
        herramienta_id: '',
        tipo_alerta_id: '',
        prioridad_id: '',
        fecha_limite: '',
        descripcion: ''
      },
      // Add the errors object here
      errors: {
        herramienta_id: false,
        tipo_alerta_id: false,
        prioridad_id: false,
        fecha_limite: false,
        descripcion: false
      },
      tiposAlerta: [],
      allHerramientas: [],
      herramientasFiltradas: [],
      selectedHerramienta: null,
      herramientaSearch: '',
      showHerramientasList: false,
      loading: true,
      error: null,
      submitting: false,
      submitSuccess: false,
      minDate: new Date().toISOString().split('T')[0]
    }
  },
  async created() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      try {
        this.loading = true;
        const [tiposRes, herramientasRes] = await Promise.all([
          axios.get('/api/Tipos_Alertas'),
          axios.get('/api/Herramienta')
        ]);
        
        this.tiposAlerta = tiposRes.data;
        this.allHerramientas = herramientasRes.data;
        this.herramientasFiltradas = [...this.allHerramientas];
      } catch (error) {
        console.error('Error al cargar datos:', error);
        this.error = 'Error al cargar los datos necesarios';
      } finally {
        this.loading = false;
      }
    },

    searchHerramientas() {
      if (this.herramientaSearch.trim() === '') {
        this.herramientasFiltradas = [...this.allHerramientas];
        this.showHerramientasList = false;
      } else {
        this.herramientasFiltradas = this.allHerramientas.filter(herramienta =>
          herramienta.nombre.toLowerCase().includes(this.herramientaSearch.toLowerCase()) ||
          herramienta.codigo.toLowerCase().includes(this.herramientaSearch.toLowerCase())
        );
        this.showHerramientasList = true;
      }
    },

    async selectHerramienta() {
      if (this.formData.herramienta_id) {
        try {
          const response = await axios.get(`/api/Herramienta/${this.formData.herramienta_id}`);
          this.selectedHerramienta = response.data;
          this.herramientaSearch = this.selectedHerramienta.nombre;
          this.showHerramientasList = false;
          this.errors.herramienta_id = false; // Clear error when selection is made
        } catch (error) {
          console.error('Error al obtener herramienta:', error);
          this.error = 'Error al cargar los datos de la herramienta';
        }
      }
    },

    validateForm() {
      this.errors = {
        herramienta_id: !this.formData.herramienta_id,
        tipo_alerta_id: !this.formData.tipo_alerta_id,
        prioridad_id: !this.formData.prioridad_id,
        fecha_limite: !this.formData.fecha_limite,
        descripcion: !this.formData.descripcion.trim()
      };
      
      return !Object.values(this.errors).some(error => error);
    },

    async submitForm() {
      // Clear previous errors
      this.error = null;
      
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.submitting = true;
      try {
        // Validar que se haya seleccionado una herramienta
        if (!this.formData.herramienta_id || !this.selectedHerramienta) {
          throw new Error('Debe seleccionar una herramienta válida');
        }

        const alertaData = {
          herramienta_id: this.formData.herramienta_id,
          tipo_alerta_id: this.formData.tipo_alerta_id,
          prioridad_id: this.formData.prioridad_id,
          fecha_limite: this.formData.fecha_limite,
          descripcion: this.formData.descripcion,
          estado_reparacion: 1 // Estado inicial (Pendiente)
        };

        await axios.post('/api/AlertaReparacion', alertaData);
        this.submitSuccess = true;
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        this.error = error.response?.data?.message || error.message || 'Error al enviar el reporte';
      } finally {
        this.submitting = false;
      }
    },

    resetForm() {
      this.formData = {
        herramienta_id: '',
        tipo_alerta_id: '',
        prioridad_id: '',
        fecha_limite: '',
        descripcion: ''
      };
      this.errors = {
        herramienta_id: false,
        tipo_alerta_id: false,
        prioridad_id: false,
        fecha_limite: false,
        descripcion: false
      };
      this.selectedHerramienta = null;
      this.herramientaSearch = '';
      this.showHerramientasList = false;
      this.submitSuccess = false;
      this.error = null;
    }
  }
}
</script>

<style scoped>
.reportar-problema-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.header p {
  color: #7f8c8d;
  margin: 0;
}

.problema-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-group.has-error select,
.form-group.has-error input,
.form-group.has-error textarea {
  border-color: #e74c3c;
}

.error-message {
  display: block;
  margin-top: 5px;
  color: #e74c3c;
  font-size: 14px;
}

.form-actions {
  grid-column: 1 / -1;
  text-align: right;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn.primary {
  background-color: #42b983;
  color: white;
}

.btn.primary:hover {
  background-color: #3aa876;
}

.btn.primary:disabled {
  background-color: #a0d9bb;
  cursor: not-allowed;
}

.btn.small {
  padding: 5px 10px;
  font-size: 14px;
  margin-left: 10px;
}

.status-message {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  text-align: center;
}

.status-message.loading {
  background-color: #f8f9fa;
  color: #6c757d;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
}

/* Responsive */
@media (max-width: 768px) {
  .problema-form {
    grid-template-columns: 1fr;
  }
}
</style>