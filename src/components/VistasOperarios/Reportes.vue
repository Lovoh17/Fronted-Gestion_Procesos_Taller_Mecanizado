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
      <!-- Selector de herramienta -->
      <div class="form-group" :class="{ 'has-error': errors.herramienta_id }">
        <label>Herramienta:</label>
        <select v-model="formData.herramienta_id" required>
          <option value="">Seleccione una herramienta</option>
          <option v-for="herramienta in allHerramientas" :key="herramienta.id" :value="herramienta.id">
            {{ herramienta.nombre }} ({{ herramienta.codigo }})
          </option>
        </select>
        <span class="error-message" v-if="errors.herramienta_id">
          Este campo es requerido
        </span>
      </div>

      <!-- Resto del formulario -->
      <div class="form-group" :class="{ 'has-error': errors.tipo_alerta_id }">
        <label>Tipo de Alerta:</label>
        <select v-model="formData.tipo_alerta_id" required>
          <option value="">Seleccione un tipo</option>
          <option v-for="tipo in tiposAlerta" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre_alertas }}
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
          <option v-for="prioridad in prioridades" :key="prioridad.id" :value="prioridad.id">
            {{ prioridad.nombre_prioridad }}
          </option>
        </select>
        <span class="error-message" v-if="errors.prioridad_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.fecha_limite }">
        <label>Fecha Límite:</label>
        <input type="date" v-model="formData.fecha_limite" required :min="minDate" />
        <span class="error-message" v-if="errors.fecha_limite">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.descripcion }">
        <label>Descripción del Problema:</label>
        <textarea v-model="formData.descripcion" required placeholder="Describa el problema con detalle..."></textarea>
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
      prioridades: [],
      allHerramientas: [],
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
        console.log('🔄 Iniciando carga de datos...');

        const [tiposRes, herramientasRes, prioridadesRes] = await Promise.all([
          axios.get('/api/Tipos_Alertas'),
          axios.get('/api/Herramienta'),
          axios.get('/api/prioridad_mantenimiento')
        ]);

        console.log('📊 Tipos de Alerta recibidos:', tiposRes.data);
        console.log('🔧 Herramientas recibidas:', herramientasRes.data);
        console.log('⚡ Prioridades recibidas:', prioridadesRes.data);
        console.log('📈 Total herramientas:', herramientasRes.data?.length || 0);
        console.log('📈 Total tipos alerta:', tiposRes.data?.length || 0);
        console.log('📈 Total prioridades:', prioridadesRes.data?.length || 0);

        this.tiposAlerta = tiposRes.data;
        this.allHerramientas = herramientasRes.data;
        this.prioridades = prioridadesRes.data;

        console.log('✅ Datos cargados exitosamente');
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        console.error('📝 Detalles del error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        this.error = 'Error al cargar los datos necesarios';
      } finally {
        this.loading = false;
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
  console.log('📤 Iniciando envío del formulario...');
  console.log('📋 Datos del formulario:', this.formData);

  this.error = null;

  if (!this.validateForm()) {
    console.log('❌ Validación fallida, errores:', this.errors);
    return;
  }

  console.log('✅ Validación exitosa');

  this.submitting = true;
  try {
    if (!this.formData.herramienta_id) {
      throw new Error('Debe seleccionar una herramienta válida');
    }

    const alertaData = {
      herramienta_id: parseInt(this.formData.herramienta_id),
      tipo_alerta_id: parseInt(this.formData.tipo_alerta_id),
      prioridad_id: parseInt(this.formData.prioridad_id),
      fecha_limite: this.formData.fecha_limite,
      descripcion: this.formData.descripcion.trim(),
      estado_reparacion: 1
    };

    console.log('📡 Enviando datos de alerta:', alertaData);

    const response = await axios.post('/api/AlertaReparacion', alertaData);

    console.log('✅ Alerta creada exitosamente:', response.data);
    this.submitSuccess = true;
  } catch (error) {
    console.error('❌ Error al enviar el formulario:', error);
    console.error('📝 Detalles completos del error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      // Información adicional para debugging
      config: error.config?.data
    });
    
    // Mostrar mensaje específico del servidor
    if (error.response?.data?.error) {
      this.error = error.response.data.error;
    } else {
      this.error = error.message || 'Error al enviar el reporte';
    }
  } finally {
    this.submitting = false;
  }
}
    ,

    resetForm() {
      console.log('🔄 Reseteando formulario...');

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
      this.submitSuccess = false;
      this.error = null;

      console.log('✅ Formulario reseteado');
    }
  }
}
</script>

<style scoped>
.reportar-problema-container {
  max-width: 1000px;
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
  background-color: #fff;
  color: #2c3e50;
}

/* Estilos específicos para select */
.form-group select {
  /* Remover estilos del navegador */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Color de fondo y texto */
  background-color: #f8f9fa;
  color: #495057;

  /* Flecha personalizada */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Estados de focus y hover para select */
.form-group select:focus {
  outline: none;
  border-color: #6c757d;
  background-color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
}

.form-group select:hover {
  border-color: #6c757d;
  background-color: #fff;
}

/* Estilos para opciones del select */
.form-group select option {
  background-color: #fff;
  color: #495057;
  padding: 8px 12px;
}

.form-group select option:checked {
  background-color: #6c757d;
  color: #fff;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
}

.form-group.has-error select,
.form-group.has-error input,
.form-group.has-error textarea {
  border-color: #e74c3c;
}

.form-group.has-error select:focus,
.form-group.has-error input:focus,
.form-group.has-error textarea:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25);
}

.error-message {
  display: block;
  margin-top: 5px;
  color: #e74c3c;
  font-size: 14px;
}

.search-select {
  position: relative;
}

.selected-item {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  color: #495057;
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