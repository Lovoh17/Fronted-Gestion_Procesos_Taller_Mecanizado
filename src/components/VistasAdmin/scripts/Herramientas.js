import axios from 'axios';

export default {
  name: 'HerramientasComponent',
  data() {
    return {
      herramientas: [],
      herramienta: {
        nombre: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: '',
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
      defaultImage: 'https://via.placeholder.com/300x200?text=Sin+imagen'
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
  created() {
    this.fetchHerramientas();
  },
  methods: {
    async fetchHerramientas() {
      this.loading = true;
      try {
        const response = await axios.get('/api/Herramienta');
        this.herramientas = response.data;
      } catch (error) {
        console.error('Error al obtener herramientas:', error);
        this.$toast.error('No se pudieron cargar las herramientas');
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      try {
        // Preparar datos para enviar
        const dataToSend = { ...this.herramienta };

        // Convertir especificaciones técnicas si es un string
        if (typeof dataToSend.especificaciones_tecnicas === 'string') {
          try {
            dataToSend.especificaciones_tecnicas = JSON.parse(dataToSend.especificaciones_tecnicas);
          } catch {
            dataToSend.especificaciones_tecnicas = {};
          }
        }

        if (this.editing) {
          await axios.put(`/api/Herramienta/${this.currentId}`, dataToSend);
          this.$toast.success('Herramienta actualizada correctamente');
        } else {
          await axios.post('/api/Herramienta', dataToSend);
          this.$toast.success('Herramienta creada correctamente');
        }

        this.resetForm();
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al guardar herramienta:', error);
        this.$toast.error('Error al guardar la herramienta');
      }
    },
    async editHerramienta(id) {
      try {
        const response = await axios.get(`/api/Herramienta/${id}`);
        this.herramienta = response.data;

        // Convertir especificaciones técnicas a string si es objeto
        if (this.herramienta.especificaciones_tecnicas && typeof this.herramienta.especificaciones_tecnicas === 'object') {
          this.herramienta.especificaciones_tecnicas = JSON.stringify(this.herramienta.especificaciones_tecnicas, null, 2);
        }

        this.editing = true;
        this.currentId = id;
        this.showForm = true;
      } catch (error) {
        console.error('Error al obtener herramienta:', error);
        this.$toast.error('No se pudo cargar la herramienta para editar');
      }
    },
    confirmDelete(id) {
      const herramienta = this.herramientas.find(h => h.id === id);
      this.herramientaToDelete = id;
      this.herramientaToDeleteName = herramienta ? `${herramienta.nombre} - ${herramienta.modelo}` : 'esta herramienta';
      this.showDeleteModal = true;
    },
    async deleteHerramienta() {
      try {
        await axios.delete(`/api/Herramienta/${this.herramientaToDelete}`);
        this.$toast.success('Herramienta eliminada correctamente');
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al eliminar herramienta:', error);
        this.$toast.error('Error al eliminar la herramienta');
      } finally {
        this.showDeleteModal = false;
        this.herramientaToDelete = null;
        this.herramientaToDeleteName = '';
      }
    },
    resetForm() {
      this.herramienta = {
        nombre: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: '',
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
    },
    showDetails(herramienta) {
      this.selectedHerramienta = { ...herramienta };
    },
    getEstadoName(id) {
      const estados = {
        1: 'Disponible',
        2: 'En uso',
        3: 'Mantenimiento',
        4: 'Dañado'
      };
      return estados[id] || 'Desconocido';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES');
    },
    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    formatSpecs(specs) {
      if (!specs) return 'N/A';
      if (typeof specs === 'string') return specs;
      return JSON.stringify(specs, null, 2);
    },
    calcularPorcentajeUso(herramienta) {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0;
      const porcentaje = (herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100;
      return Math.min(100, Math.round(porcentaje));
    }
  }
};

