import axios from 'axios';
import UploadBlueprintModal from '../ComponentesCoordinador/UploadBlueprintModal.vue';
import ModalDetallesPlanoHerramienta from '../ComponentesCoordinador/ModalDetallesPlanoHerramienta.vue';

export default {
  name: 'ToolBlueprintsView',
  components: {
    UploadBlueprintModal,
    ModalDetallesPlanoHerramienta
  },
  data() {
    return {
      items: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedItem: null,
      showUploadModal: false
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.items;
      
      const query = this.searchQuery.toLowerCase();
      return this.items.filter(item => {
        return (
          item.herramienta.nombre.toLowerCase().includes(query) ||
          item.plano.codigo.toLowerCase().includes(query) ||
          (item.plano.descripcion && item.plano.descripcion.toLowerCase().includes(query)) ||
          item.herramienta.codigo.toLowerCase().includes(query)
        );
      });
    }
  },
  watch: {
    searchQuery(newQuery) {
      // El filtrado se maneja automáticamente por el computed filteredItems
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Intentar cargar datos reales de la API
        const [relacionesRes, planosRes, herramientasRes] = await Promise.all([
          axios.get('/api/Plano_Herramienta'),
          axios.get('/api/Plano'),
          axios.get('/api/Herramienta')
        ]);

        this.items = relacionesRes.data.map(relacion => {
          const plano = planosRes.data.find(p => p.id === relacion.plano_id);
          const herramienta = herramientasRes.data.find(h => h.id === relacion.herramienta_id);
          
          return {
            ...relacion,
            plano: {
              id: plano?.id,
              codigo: plano?.codigo || 'N/A',
              descripcion: plano?.descripcion,
              imagen_url: plano?.imagen_url,
              version: plano?.version
            },
            herramienta: {
              id: herramienta?.id,
              nombre: herramienta?.nombre || 'Desconocida',
              codigo: herramienta?.codigo || 'N/A',
              estado: herramienta?.estado || 'N/A',
              modelo: herramienta?.modelo || 'N/A',
              fabricante: herramienta?.fabricante || 'N/A',
              numero_serie: herramienta?.numero_serie || 'N/A',
              especificaciones_tecnicas: herramienta?.especificaciones_tecnicas,
              horas_uso_actual: herramienta?.horas_uso_actual
            }
          };
        });

      } catch (err) {
        console.error('Error fetching data from API, using fallback data:', err);
        this.error = 'Usando datos de ejemplo (API no disponible)';
        
        // Datos de ejemplo para desarrollo
        this.items = [
          {
            id: 1,
            cantidad_necesaria: 2,
            tiempo_estimado_uso: 8,
            notas: 'Plano principal para taladro industrial',
            fecha_creacion: '2024-01-15',
            fecha_actualizacion: '2024-02-20',
            plano: {
              id: 1,
              codigo: 'PLN-001',
              descripcion: 'Plano técnico para taladro de banco modelo TD-500',
              imagen_url: 'https://via.placeholder.com/400x300?text=Plano+TD-500',
              version: '2.1'
            },
            herramienta: {
              id: 1,
              nombre: 'Taladro de Banco',
              codigo: 'TD-500',
              estado: 'disponible',
              modelo: 'TD-500X',
              fabricante: 'IndustrialTools',
              numero_serie: 'IT-TD-2024-001',
              especificaciones_tecnicas: 'Motor 1.5HP, Velocidad variable 50-3000 RPM, Capacidad max 13mm',
              horas_uso_actual: 245
            }
          },
          {
            id: 2,
            cantidad_necesaria: 1,
            tiempo_estimado_uso: 4,
            notas: 'Plano para sierra circular portátil',
            fecha_creacion: '2024-01-20',
            fecha_actualizacion: '2024-02-15',
            plano: {
              id: 2,
              codigo: 'PLN-002',
              descripcion: 'Especificaciones técnicas para sierra circular modelo SC-180',
              imagen_url: 'https://via.placeholder.com/400x300?text=Plano+SC-180',
              version: '1.0'
            },
            herramienta: {
              id: 2,
              nombre: 'Sierra Circular',
              codigo: 'SC-180',
              estado: 'en-uso',
              modelo: 'SC-180PRO',
              fabricante: 'CuttingEdge',
              numero_serie: 'CE-SC-2024-002',
              especificaciones_tecnicas: 'Disco 184mm, Motor 1400W, Profundidad corte 65mm',
              horas_uso_actual: 120
            }
          }
        ];
      } finally {
        this.loading = false;
      }
    },
    
    openDetails(item) {
      this.selectedItem = item;
    },
    
    editarPlano(blueprintItem) {
      // Lógica para editar el plano
      console.log('Editar plano:', blueprintItem);
      this.selectedItem = null;
      // Aquí podrías abrir un modal de edición o navegar a una página de edición
    },
    
    handleUploadSuccess(uploadedData) {
      // Manejar el éxito de la subida
      console.log('Archivo subido exitosamente:', uploadedData);
      
      // Recargar los datos para incluir el nuevo plano
      this.fetchData();
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    }
  }
};