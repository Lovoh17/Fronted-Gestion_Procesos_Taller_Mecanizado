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

      const query = this.searchQuery.toLowerCase().trim();
      return this.items.filter(item => {
        // Función auxiliar para buscar en texto, manejando objetos y strings
        const searchInText = (text) => {
          if (!text) return false;
          if (typeof text === 'object') {
            return JSON.stringify(text).toLowerCase().includes(query);
          }
          return text.toString().toLowerCase().includes(query);
        };

        return (
          searchInText(item.herramienta?.nombre) ||
          searchInText(item.herramienta?.codigo) ||
          searchInText(item.plano?.codigo) ||
          searchInText(item.plano?.descripcion) ||
          searchInText(item.plano?.nombre) ||
          searchInText(item.herramienta?.fabricante) ||
          searchInText(item.herramienta?.modelo) ||
          searchInText(item.notas)
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
        // Cargar datos de las 3 APIs
        const [relacionesRes, planosRes, herramientasRes] = await Promise.all([
          axios.get('/api/Plano_Herramienta'),
          axios.get('/api/Plano'),
          axios.get('/api/Herramienta')
        ]);

        // Mapear correctamente según la estructura real de la API
        this.items = relacionesRes.data.map(relacion => {
          const plano = planosRes.data.find(p => p.id === relacion.plano_id);
          const herramienta = herramientasRes.data.find(h => h.id === relacion.herramienta_id);

          return {
            ...relacion,
            plano: {
              id: plano?.id,
              // Usar 'nombre' como código si no existe 'codigo'
              codigo: plano?.codigo || plano?.nombre || 'N/A',
              nombre: plano?.nombre,
              descripcion: plano?.descripcion,
              // Mapear correctamente la imagen
              imagen_url: plano?.imagen_ruta || plano?.imagen_url,
              version: plano?.version,
              estado: plano?.estado,
              archivo_ruta: plano?.archivo_ruta
            },
            herramienta: {
              id: herramienta?.id,
              nombre: herramienta?.nombre || 'Desconocida',
              // Usar 'codigo_inventario' o 'codigo_unico' como código
              codigo: herramienta?.codigo || herramienta?.codigo_inventario || herramienta?.codigo_unico || 'N/A',
              // Mapear el estado desde 'estado_herramienta_id'
              estado: this.getEstadoTexto(herramienta?.estado_herramienta_id) || 'N/A',
              modelo: herramienta?.modelo || 'N/A',
              fabricante: herramienta?.fabricante || 'N/A',
              numero_serie: herramienta?.numero_serie || 'N/A',
              especificaciones_tecnicas: herramienta?.especificaciones_tecnicas,
              horas_uso_actual: herramienta?.horas_uso_actual,
              vida_util_horas: herramienta?.vida_util_horas,
              fecha_adquisicion: herramienta?.fecha_adquisicion,
              imagen_ruta: herramienta?.imagen_ruta
            }
          };
        });

      } catch (err) {
        console.error('Error fetching data from API:', err);
        this.error = 'Error al cargar datos de la API - usando datos de ejemplo';
        // Cargar datos de ejemplo como fallback
        this.loadFallbackData();
      } finally {
        this.loading = false;
      }
    },

    // Método para convertir ID de estado a texto
    getEstadoTexto(estadoId) {
      const estados = {
        1: 'disponible',
        2: 'en-uso',
        3: 'mantenimiento',
        4: 'fuera-de-servicio'
      };
      return estados[estadoId] || 'desconocido';
    },

    // Método separado para datos de fallback
    loadFallbackData() {
      this.items = [
        {
          id: "1",
          plano_id: "1",
          herramienta_id: "2",
          cantidad_necesaria: 2,
          tiempo_estimado_uso: "8.5",
          notas: "Soldadoras MIG para estructura principal",
          plano: {
            id: "1",
            codigo: "Estructura Soporte Principal",
            nombre: "Estructura Soporte Principal",
            descripcion: "Soporte para equipo pesado de soldadura",
            imagen_url: "/planos/estructura_soporte_principal_v1.2.dwg",
            version: "1.2",
            estado: "aprobado",
            archivo_ruta: "/planos/estructura_soporte_principal_v1.2.dwg"
          },
          herramienta: {
            id: "2",
            nombre: "Soldadora TIG-ACDC Premium",
            codigo: "SLD-TIG225-001",
            estado: "disponible",
            modelo: "Precision TIG 225",
            fabricante: "Lincoln Electric",
            numero_serie: "SN-TIG225-001",
            especificaciones_tecnicas: {
              rango_amperaje: "5-225A",
              frecuencia: "20-400Hz"
            },
            horas_uso_actual: "800",
            vida_util_horas: "6000",
            fecha_adquisicion: "2022-03-10",
            imagen_ruta: "/img/herramientas/soldadora_tig225.jpg"
          }
        },
        {
          id: "2",
          plano_id: "1",
          herramienta_id: "4",
          cantidad_necesaria: 1,
          tiempo_estimado_uso: "3.0",
          notas: "Cortadora plasma para cortes precisos",
          plano: {
            id: "1",
            codigo: "Estructura Soporte Principal",
            nombre: "Estructura Soporte Principal",
            descripcion: "Soporte para equipo pesado de soldadura",
            imagen_url: "/planos/estructura_soporte_principal_v1.2.dwg",
            version: "1.2",
            estado: "aprobado"
          },
          herramienta: {
            id: "4",
            nombre: "Cortadora Plasma CNC",
            codigo: "CRT-PLASMA-001",
            estado: "disponible",
            modelo: "PlasmaMax 45",
            fabricante: "HyperTherm",
            numero_serie: "SN-PLS45-001",
            especificaciones_tecnicas: {
              corriente_corte: "45A",
              espesor_max: "16mm"
            },
            horas_uso_actual: "150",
            vida_util_horas: "5000"
          }
        },
        {
          id: "3",
          plano_id: "2",
          herramienta_id: "2",
          cantidad_necesaria: 1,
          tiempo_estimado_uso: "6.0",
          notas: "Soldadora TIG para acabados de calidad",
          plano: {
            id: "2",
            codigo: "Bancada de Trabajo Ajustable",
            nombre: "Bancada de Trabajo Ajustable",
            descripcion: "Bancada ajustable para soldadura TIG",
            imagen_url: "/planos/bancada_trabajo_ajustable_v2.0.dwg",
            version: "2.0",
            estado: "aprobado"
          },
          herramienta: {
            id: "2",
            nombre: "Soldadora TIG-ACDC Premium",
            codigo: "SLD-TIG225-001",
            estado: "disponible",
            modelo: "Precision TIG 225",
            fabricante: "Lincoln Electric",
            numero_serie: "SN-TIG225-001",
            especificaciones_tecnicas: {
              rango_amperaje: "5-225A",
              frecuencia: "20-400Hz"
            },
            horas_uso_actual: "800"
          }
        }
      ];
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