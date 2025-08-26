import axios from 'axios';
import ModalDetallesHerramienta from '../ComponentesAdmin/ModalDetallesHerramienta.vue';

export default {
  name: 'HerramientasComponent',
  components: {
    ModalDetallesHerramienta
  },
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
    },
    
    estadoOptions() {
      return [
        { value: 1, label: 'Disponible' },
        { value: 2, label: 'En uso' },
        { value: 3, label: 'Mantenimiento' },
        { value: 4, label: 'Dañado' }
      ];
    },

    // Función de formateo para VaDateInput
    dateFormatFunction() {
      return (date) => {
        if (!date) return '';
        if (date instanceof Date) {
          return date.toLocaleDateString('es-ES');
        }
        // Si es string, intentar convertir a Date primero
        const dateObj = new Date(date);
        return isNaN(dateObj.getTime()) ? date : dateObj.toLocaleDateString('es-ES');
      };
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
        this.showToast('No se pudieron cargar las herramientas', 'danger');
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

        // Convertir fechas si son objetos Date
        if (dataToSend.fecha_adquisicion instanceof Date) {
          dataToSend.fecha_adquisicion = dataToSend.fecha_adquisicion.toISOString().split('T')[0];
        }
        if (dataToSend.fecha_ultimo_mantenimiento instanceof Date) {
          dataToSend.fecha_ultimo_mantenimiento = dataToSend.fecha_ultimo_mantenimiento.toISOString().split('T')[0];
        }
        if (dataToSend.fecha_proximo_mantenimiento instanceof Date) {
          dataToSend.fecha_proximo_mantenimiento = dataToSend.fecha_proximo_mantenimiento.toISOString().split('T')[0];
        }

        if (this.editing) {
          await axios.put(`/api/Herramienta/${this.currentId}`, dataToSend);
          this.showToast('Herramienta actualizada correctamente', 'success');
        } else {
          await axios.post('/api/Herramienta', dataToSend);
          this.showToast('Herramienta creada correctamente', 'success');
        }

        this.closeFormModal();
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al guardar herramienta:', error);
        this.showToast('Error al guardar la herramienta', 'danger');
      }
    },
    
    async editHerramienta(id) {
      try {
        const response = await axios.get(`/api/Herramienta/${id}`);
        this.herramienta = { ...response.data };

        // Convertir especificaciones técnicas a string si es objeto
        if (this.herramienta.especificaciones_tecnicas && typeof this.herramienta.especificaciones_tecnicas === 'object') {
          this.herramienta.especificaciones_tecnicas = JSON.stringify(this.herramienta.especificaciones_tecnicas, null, 2);
        }

        // Convertir fechas string a objetos Date para VaDateInput
        if (this.herramienta.fecha_adquisicion) {
          // Asegurarse de que la fecha se parse correctamente
          const fecha = new Date(this.herramienta.fecha_adquisicion + 'T00:00:00.000Z');
          this.herramienta.fecha_adquisicion = fecha;
        }
        if (this.herramienta.fecha_ultimo_mantenimiento) {
          const fecha = new Date(this.herramienta.fecha_ultimo_mantenimiento + 'T00:00:00.000Z');
          this.herramienta.fecha_ultimo_mantenimiento = fecha;
        }
        if (this.herramienta.fecha_proximo_mantenimiento) {
          const fecha = new Date(this.herramienta.fecha_proximo_mantenimiento + 'T00:00:00.000Z');
          this.herramienta.fecha_proximo_mantenimiento = fecha;
        }

        this.editing = true;
        this.currentId = id;
        this.showForm = true;
      } catch (error) {
        console.error('Error al obtener herramienta:', error);
        this.showToast('No se pudo cargar la herramienta para editar', 'danger');
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
        this.showToast('Herramienta eliminada correctamente', 'success');
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al eliminar herramienta:', error);
        this.showToast('Error al eliminar la herramienta', 'danger');
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
    
    closeFormModal() {
      this.showForm = false;
      this.resetForm();
    },
    
    showDetails(herramienta) {
      this.selectedHerramienta = { ...herramienta };
    },
    
    closeDetailsModal() {
      this.selectedHerramienta = null;
    },
    
    handleEditFromModal(id) {
      this.selectedHerramienta = null;
      this.editHerramienta(id);
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
    
    calcularPorcentajeUso(herramienta) {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0;
      const porcentaje = (herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100;
      return Math.min(100, Math.round(porcentaje));
    },
    
    showToast(message, color = 'info') {
      // Verificar si $va está disponible
      if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color
        });
      } else {
        // Fallback a console.log si $va no está disponible
        console.log(`[${color.toUpperCase()}] ${message}`);
      }
    }
  }
};