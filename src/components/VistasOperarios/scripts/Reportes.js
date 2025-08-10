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
      minDate: new Date()
    }
  },
  async created() {
    await this.loadInitialData();
  },
  computed: {
    // Transform herramientas array for va-select
    herramientaOptions() {
      return this.allHerramientas.map(herramienta => ({
        value: herramienta.id,
        text: `${herramienta.nombre} (${herramienta.codigo})`
      }));
    },
    
    // Transform tipos de alerta array for va-select
    tipoAlertaOptions() {
      return this.tiposAlerta.map(tipo => ({
        value: tipo.id,
        text: tipo.nombre_alertas
      }));
    },
    
    // Transform prioridades array for va-select
    prioridadOptions() {
      return this.prioridades.map(prioridad => ({
        value: prioridad.id,
        text: prioridad.nombre_prioridad
      }));
    }
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

    // Convert date to API format (YYYY-MM-DD)
    let fechaLimiteFormatted = this.formData.fecha_limite;
    if (this.formData.fecha_limite instanceof Date) {
      fechaLimiteFormatted = this.formData.fecha_limite.toISOString().split('T')[0];
    } else if (typeof this.formData.fecha_limite === 'string' && this.formData.fecha_limite.includes('/')) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = this.formData.fecha_limite.split('/');
      fechaLimiteFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const alertaData = {
      herramienta_id: parseInt(this.formData.herramienta_id),
      tipo_alerta_id: parseInt(this.formData.tipo_alerta_id),
      prioridad_id: parseInt(this.formData.prioridad_id),
      fecha_limite: fechaLimiteFormatted,
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
    },

    // Date formatting methods for Vuestic date picker
    formatDate(date) {
      if (!date) return '';
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    },

    parseDate(dateString) {
      if (!dateString) return null;
      
      // If already a date object, return it
      if (dateString instanceof Date) {
        return dateString;
      }
      
      // Handle DD/MM/YYYY format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
      }
      
      // Handle YYYY-MM-DD format (ISO)
      if (typeof dateString === 'string' && dateString.includes('-')) {
        return new Date(dateString);
      }
      
      return new Date(dateString);
    }
  }
}