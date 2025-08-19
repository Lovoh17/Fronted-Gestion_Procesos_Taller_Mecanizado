import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:3000/api';

export default {
  name: 'HerramientasComponent',
  data() {
    return {
      herramientas: [],
      herramienta: {
        nombre: '',
        tipo_herramienta_id: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: 0,
        zonas_trabajo_id: '',
        fecha_adquisicion: '',
        costo_adquisicion: '',
        valor_actual: '',
        especificaciones_tecnicas: '',
        imagen_ruta: '',
        fecha_ultimo_mantenimiento: '',
        fecha_proximo_mantenimiento: '',
        notas: ''
      },
      editing: false,
      currentId: null,
      searchQuery: '',
      filterEstado: '',
      loading: false,
      showForm: false,
      selectedHerramienta: null,
      showDeleteModal: false,
      herramientaToDelete: null,
      herramientaToDeleteName: '',
      // Nuevas propiedades para checkout/checkin
      showCheckoutModal: false,
      usuarioId: '', // Esto debería venir del sistema de autenticación
      // Catálogos para selects
      tiposHerramienta: [],
      zonasTrabajos: [],
      defaultImage: 'https://images.pexels.com/photos/210881/pexels-photo-210881.jpeg?cs=srgb&dl=pexels-pixabay-210881.jpg&fm=jpg'
    };
  },
  computed: {
    filteredHerramientas() {
      let filtered = this.herramientas;

      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(h =>
          h.nombre.toLowerCase().includes(query) ||
          h.modelo.toLowerCase().includes(query) ||
          (h.fabricante && h.fabricante.toLowerCase().includes(query)) ||
          (h.codigo_inventario && h.codigo_inventario.toLowerCase().includes(query))
        );
      }

      // Filtrar por estado
      if (this.filterEstado) {
        filtered = filtered.filter(h => h.estado_herramienta_id == this.filterEstado);
      }

      return filtered;
    }
  },
  async created() {
    await this.initializeComponent();
  },
  methods: {
    async initializeComponent() {
      try {
        await Promise.all([
          this.fetchHerramientas(),
          this.loadCatalogos()
        ]);
      } catch (error) {
        console.error('Error al inicializar componente:', error);
        this.$toast.error('Error al cargar datos iniciales');
      }
    },

    async loadCatalogos() {
      try {
        // Cargar tipos de herramientas y zonas de trabajo
        // Estas URLs deberías ajustarlas según tu backend
        const [tiposResponse, zonasResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/Tipo_Herramienta`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/Zona_Trabajo`).catch(() => ({ data: [] }))
        ]);
        
        this.tiposHerramienta = tiposResponse.data;
        this.zonasTrabajos = zonasResponse.data;
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      }
    },

    async fetchHerramientas() {
      this.loading = true;
      try {
        const response = await axios.get('/api/Herramienta');
        this.herramientas = response.data || [];
        
        if (this.herramientas.length === 0) {
          this.$toast.info('No hay herramientas registradas');
        }
      } catch (error) {
        console.error('Error al obtener herramientas:', error);
        this.handleApiError(error, 'No se pudieron cargar las herramientas');
        this.herramientas = [];
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      try {
        this.loading = true;
        
        // Validar campos requeridos
        if (!this.validateForm()) {
          return;
        }

        // Preparar datos para enviar
        const dataToSend = this.prepareFormData();

        let response;
        if (this.editing) {
          response = await axios.put(`${API_BASE_URL}/Herramienta/${this.currentId}`, dataToSend);
          this.$toast.success('Herramienta actualizada correctamente');
        } else {
          response = await axios.post(`${API_BASE_URL}/Herramienta`, dataToSend);
          this.$toast.success('Herramienta creada correctamente');
        }

        this.resetForm();
        await this.fetchHerramientas();
        
      } catch (error) {
        console.error('Error al guardar herramienta:', error);
        this.handleApiError(error, 'Error al guardar la herramienta');
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      if (!this.herramienta.nombre.trim()) {
        this.$toast.error('El nombre es requerido');
        return false;
      }
      if (!this.herramienta.modelo.trim()) {
        this.$toast.error('El modelo es requerido');
        return false;
      }
      return true;
    },

    prepareFormData() {
      const data = { ...this.herramienta };
      
      // Convertir strings vacíos a null para campos numéricos
      const numericFields = ['tipo_herramienta_id', 'estado_herramienta_id', 'vida_util_horas', 'horas_uso_actual', 'zonas_trabajo_id', 'costo_adquisicion', 'valor_actual'];
      numericFields.forEach(field => {
        if (data[field] === '' || data[field] === undefined) {
          data[field] = null;
        } else if (typeof data[field] === 'string' && !isNaN(data[field])) {
          data[field] = parseFloat(data[field]);
        }
      });

      // Manejar especificaciones técnicas
      if (typeof data.especificaciones_tecnicas === 'string' && data.especificaciones_tecnicas.trim()) {
        try {
          // Intentar parsear como JSON, si falla mantener como string
          JSON.parse(data.especificaciones_tecnicas);
        } catch {
          // Es texto plano, mantener como está
        }
      }

      // Agregar timestamp si no existe
      if (!this.editing) {
        data.timestamps = new Date().toISOString();
      }

      return data;
    },

    async editHerramienta(id) {
      try {
        this.loading = true;
        const response = await axios.get(`${API_BASE_URL}/Herramienta/${id}`);
        
        if (!response.data) {
          throw new Error('Herramienta no encontrada');
        }

        this.herramienta = { ...response.data };

        // Convertir especificaciones técnicas a string para edición
        if (this.herramienta.especificaciones_tecnicas && typeof this.herramienta.especificaciones_tecnicas === 'object') {
          this.herramienta.especificaciones_tecnicas = JSON.stringify(this.herramienta.especificaciones_tecnicas, null, 2);
        }

        // Convertir fechas al formato correcto para inputs
        const dateFields = ['fecha_adquisicion', 'fecha_ultimo_mantenimiento', 'fecha_proximo_mantenimiento'];
        dateFields.forEach(field => {
          if (this.herramienta[field]) {
            this.herramienta[field] = this.formatDateForInput(this.herramienta[field]);
          }
        });

        this.editing = true;
        this.currentId = id;
        this.showForm = true;
        this.selectedHerramienta = null; // Cerrar modal de detalles si está abierto

      } catch (error) {
        console.error('Error al obtener herramienta:', error);
        this.handleApiError(error, 'No se pudo cargar la herramienta para editar');
      } finally {
        this.loading = false;
      }
    },

    confirmDelete(id) {
      const herramienta = this.herramientas.find(h => h.id === id);
      if (!herramienta) {
        this.$toast.error('Herramienta no encontrada');
        return;
      }
      
      this.herramientaToDelete = id;
      this.herramientaToDeleteName = `${herramienta.nombre} - ${herramienta.modelo}`;
      this.showDeleteModal = true;
    },

    async deleteHerramienta() {
      try {
        this.loading = true;
        await axios.delete(`${API_BASE_URL}/Herramienta/${this.herramientaToDelete}`);
        this.$toast.success('Herramienta eliminada correctamente');
        await this.fetchHerramientas();
      } catch (error) {
        console.error('Error al eliminar herramienta:', error);
        this.handleApiError(error, 'Error al eliminar la herramienta');
      } finally {
        this.loading = false;
        this.showDeleteModal = false;
        this.herramientaToDelete = null;
        this.herramientaToDeleteName = '';
      }
    },

    // Nuevos métodos para checkout/checkin
    async ocuparHerramienta(herramientaId, usuarioId = null) {
      try {
        this.loading = true;
        const userId = usuarioId || this.usuarioId || 1; // Fallback temporal
        
        const response = await axios.get(`${API_BASE_URL}/HerramientaOcupar/${herramientaId}/${userId}`);
        
        this.$toast.success('Herramienta ocupada correctamente');
        await this.fetchHerramientas();
        
        return response.data;
      } catch (error) {
        console.error('Error al ocupar herramienta:', error);
        this.handleApiError(error, 'Error al ocupar la herramienta');
      } finally {
        this.loading = false;
      }
    },

    async desOcuparHerramienta(herramientaId) {
      try {
        this.loading = true;
        
        const response = await axios.get(`${API_BASE_URL}/HerramientaDesOcupar/${herramientaId}`);
        
        this.$toast.success('Herramienta liberada correctamente');
        await this.fetchHerramientas();
        
        return response.data;
      } catch (error) {
        console.error('Error al liberar herramienta:', error);
        this.handleApiError(error, 'Error al liberar la herramienta');
      } finally {
        this.loading = false;
      }
    },

    // Método para manejar el checkout con modal
    showCheckoutDialog(herramientaId) {
      this.herramientaToDelete = herramientaId; // Reutilizar variable
      this.showCheckoutModal = true;
    },

    async confirmCheckout() {
      if (!this.usuarioId) {
        this.$toast.error('Debe especificar un usuario');
        return;
      }
      
      await this.ocuparHerramienta(this.herramientaToDelete, this.usuarioId);
      this.showCheckoutModal = false;
      this.usuarioId = '';
    },

    resetForm() {
      this.herramienta = {
        nombre: '',
        tipo_herramienta_id: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: 0,
        zonas_trabajo_id: '',
        fecha_adquisicion: '',
        costo_adquisicion: '',
        valor_actual: '',
        especificaciones_tecnicas: '',
        imagen_ruta: '',
        fecha_ultimo_mantenimiento: '',
        fecha_proximo_mantenimiento: '',
        notas: ''
      };
      this.editing = false;
      this.currentId = null;
      this.showForm = false;
    },

    showDetails(herramienta) {
      this.selectedHerramienta = { ...herramienta };
    },

    // Métodos de utilidad mejorados
    getEstadoName(id) {
      const estados = {
        1: 'Disponible',
        2: 'En uso',
        3: 'Mantenimiento',
        4: 'Dañado',
        5: 'Fuera de servicio'
      };
      return estados[id] || 'Desconocido';
    },

    getToolIcon(nombre) {
      const iconMap = {
        'taladro': 'fas fa-drill',
        'martillo': 'fas fa-hammer',
        'destornillador': 'fas fa-screwdriver',
        'sierra': 'fas fa-saw',
        'llave': 'fas fa-wrench',
        'soldadora': 'fas fa-fire',
        'amoladora': 'fas fa-cogs',
        'compresor': 'fas fa-wind'
      };
      
      const nombreLower = nombre.toLowerCase();
      for (const [key, icon] of Object.entries(iconMap)) {
        if (nombreLower.includes(key)) {
          return icon;
        }
      }
      return 'fas fa-tools';
    },

    formatDate(date) {
      if (!date) return '';
      try {
        return new Date(date).toLocaleDateString('es-ES');
      } catch {
        return '';
      }
    },

    formatDateForInput(date) {
      if (!date) return '';
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch {
        return '';
      }
    },

    formatCurrency(value) {
      if (!value || isNaN(value)) return '0.00';
      return parseFloat(value).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    formatSpecs(specs) {
      if (!specs) return 'N/A';
      if (typeof specs === 'string') return specs;
      if (typeof specs === 'object') {
        return JSON.stringify(specs, null, 2);
      }
      return String(specs);
    },

    calcularPorcentajeUso(herramienta) {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0;
      const porcentaje = (herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100;
      return Math.min(100, Math.round(porcentaje));
    },

    // Método para manejar errores de API
    handleApiError(error, defaultMessage = 'Ha ocurrido un error') {
      if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || defaultMessage;
        
        switch (status) {
          case 400:
            this.$toast.error(`Datos inválidos: ${message}`);
            break;
          case 404:
            this.$toast.error('Recurso no encontrado');
            break;
          case 500:
            this.$toast.error('Error interno del servidor');
            break;
          default:
            this.$toast.error(message);
        }
      } else if (error.request) {
        // Error de red
        this.$toast.error('Error de conexión con el servidor');
      } else {
        // Otros errores
        this.$toast.error(defaultMessage);
      }
    },

    // Método para refresh manual
    async refreshData() {
      await this.fetchHerramientas();
      this.$toast.success('Datos actualizados');
    }
  }
};