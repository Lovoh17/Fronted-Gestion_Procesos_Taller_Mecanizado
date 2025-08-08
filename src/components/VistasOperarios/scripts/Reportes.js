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