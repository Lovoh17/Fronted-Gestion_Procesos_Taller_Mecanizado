import { VueGoodTable } from 'vue-good-table-next';
import axios from 'axios';

export default {
  name: 'HistorialMovimientosView',
  components: {
    VueGoodTable
  },
  data() {
    return {
      // Configuración de la tabla
      columns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          width: '80px',
          sortable: true
        },
        {
          label: 'Material',
          field: 'materialNombre',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por material...'
          }
        },
        {
          label: 'Cantidad',
          field: 'cantidad',
          type: 'number',
          sortable: true,
          width: '100px'
        },
        {
          label: 'Unidad',
          field: 'unidadNombre',
          type: 'text',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Tipo Movimiento',
          field: 'tipoMovimiento',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Entrada', text: 'Entrada' },
              { value: 'Salida', text: 'Salida' },
              { value: 'Transferencia', text: 'Transferencia' },
              { value: 'Ajuste', text: 'Ajuste' },
              { value: 'Devolución', text: 'Devolución' }
            ]
          }
        },
        {
          label: 'Stock Origen',
          field: 'origenNombre',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por origen...'
          }
        },
        {
          label: 'Stock Destino',
          field: 'destinoNombre',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por destino...'
          }
        },
        {
          label: 'Usuario',
          field: 'usuarioNombre',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por usuario...'
          }
        },
        {
          label: 'Fecha Movimiento',
          field: 'fechaMovimiento',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd HH:mm:ss',
          dateOutputFormat: 'dd/MM/yyyy HH:mm',
          sortable: true,
          filterOptions: {
            enabled: true
          }
        },
        {
          label: 'Motivo',
          field: 'motivo',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por motivo...'
          }
        },
        {
          label: 'Documento',
          field: 'documentoReferencia',
          type: 'text',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Pedido',
          field: 'pedidoCodigo',
          type: 'text',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Acciones',
          field: 'acciones',
          sortable: false,
          width: '100px'
        }
      ],

      // Datos de la API
      movimientos: [],
      
      // Cache para resolución de IDs
      materialesCache: {},
      unidadesMedidaCache: {},
      tiposStockCache: {},
      usuariosCache: {},
      pedidosCache: {},

      // Configuración de filtros
      filtros: {
        tipoMovimiento: '',
        estado: '',
        departamento: '',
        usuario: '',
        proyecto: '',
        fechaInicio: '',
        fechaFin: '',
        herramienta: ''
      },

      // Configuración de búsqueda global
      searchTerm: '',

      // Configuración de la tabla
      paginationOptions: {
        enabled: true,
        mode: 'records',
        perPage: 15,
        position: 'bottom',
        perPageDropdown: [10, 15, 25, 50],
        dropdownAllowAll: false,
        setCurrentPage: 1,
        nextLabel: 'Siguiente',
        prevLabel: 'Anterior',
        rowsPerPageLabel: 'Filas por página',
        ofLabel: 'de',
        pageLabel: 'página',
        allLabel: 'Todos'
      },

      // Configuración de ordenamiento
      sortOption: {
        field: 'fechaMovimiento',
        type: 'desc'
      },

      // Estado de modales
      showDetailsModal: false,
      selectedMovimiento: null,

      // Loading state
      isLoading: false
    }
  },

  computed: {
    // Datos filtrados
    filteredData() {
      let filtered = [...this.movimientos];

      // Aplicar filtros
      if (this.filtros.tipoMovimiento) {
        filtered = filtered.filter(item => item.tipoMovimiento === this.filtros.tipoMovimiento);
      }
      if (this.filtros.estado) {
        filtered = filtered.filter(item => item.estado === this.filtros.estado);
      }
      if (this.filtros.departamento) {
        filtered = filtered.filter(item => item.departamento === this.filtros.departamento);
      }
      if (this.filtros.usuario) {
        filtered = filtered.filter(item => 
          item.usuario.toLowerCase().includes(this.filtros.usuario.toLowerCase())
        );
      }
      if (this.filtros.proyecto) {
        filtered = filtered.filter(item => 
          item.proyecto.toLowerCase().includes(this.filtros.proyecto.toLowerCase())
        );
      }
      if (this.filtros.herramienta) {
        filtered = filtered.filter(item => 
          item.herramienta.toLowerCase().includes(this.filtros.herramienta.toLowerCase())
        );
      }
      if (this.filtros.fechaInicio && this.filtros.fechaFin) {
        filtered = filtered.filter(item => {
          const fechaItem = new Date(item.fechaMovimiento);
          const fechaInicio = new Date(this.filtros.fechaInicio);
          const fechaFin = new Date(this.filtros.fechaFin);
          return fechaItem >= fechaInicio && fechaItem <= fechaFin;
        });
      }

      return filtered;
    },

    // Estadísticas
    stats() {
      const total = this.movimientos.length;
      const entradas = this.movimientos.filter(m => m.tipoMovimiento === 'Entrada').length;
      const salidas = this.movimientos.filter(m => m.tipoMovimiento === 'Salida').length;
      const transferencias = this.movimientos.filter(m => m.tipoMovimiento === 'Transferencia').length;
      const ajustes = this.movimientos.filter(m => m.tipoMovimiento === 'Ajuste').length;
      const devoluciones = this.movimientos.filter(m => m.tipoMovimiento === 'Devolución').length;
      
      // Calcular estadísticas adicionales basadas en los movimientos
      const totalCantidadEntrada = this.movimientos
        .filter(m => m.tipoMovimiento === 'Entrada')
        .reduce((sum, m) => sum + m.cantidad, 0);
        
      const totalCantidadSalida = this.movimientos
        .filter(m => m.tipoMovimiento === 'Salida')
        .reduce((sum, m) => sum + m.cantidad, 0);

      return {
        total,
        prestamos: entradas, // Mapear entradas como préstamos para compatibilidad con template
        devoluciones,
        activos: transferencias, // Mapear transferencias como activos
        vencidos: ajustes, // Mapear ajustes como vencidos
        totalHoras: totalCantidadEntrada.toFixed(1),
        totalCosto: totalCantidadSalida.toFixed(1)
      };
    },

    // Opciones de usuarios para filtro
    usuarios() {
      const usuarios = [...new Set(this.movimientos.map(m => m.usuario))];
      return usuarios.sort();
    },

    // Opciones de proyectos para filtro
    proyectos() {
      const proyectos = [...new Set(this.movimientos.map(m => m.proyecto))];
      return proyectos.sort();
    },

    // Opciones de herramientas para filtro
    herramientas() {
      const herramientas = [...new Set(this.movimientos.map(m => m.herramienta))];
      return herramientas.sort();
    }
  },

  // Lifecycle hooks
  async mounted() {
    await this.loadMovimientos();
  },
  
  methods: {
    // Cargar movimientos desde la API
    async loadMovimientos() {
      try {
        this.isLoading = true;
        
        // Cargar datos base para cache
        await Promise.all([
          this.loadMateriales(),
          this.loadUnidadesMedida(),
          this.loadTiposStock(),
          this.loadUsuarios(),
          this.loadPedidos()
        ]);
        
        // Cargar movimientos de stock
        const response = await axios.get('/api/Historial_Movimiento_Stock');    
        const movimientosRaw = response.data;
        
        // Transformar datos resolviendo foreign keys
        this.movimientos = await Promise.all(
          movimientosRaw.map(async (movimiento) => {
            return {
              id: movimiento.id || 0,
              materialId: movimiento.material_id,
              materialNombre: await this.resolveMaterial(movimiento.material_id),
              cantidad: parseFloat(movimiento.cantidad) || 0,
              unidadId: movimiento.unidad_medida_id,
              unidadNombre: await this.resolveUnidadMedida(movimiento.unidad_medida_id),
              origenId: movimiento.origen_stock_id,
              origenNombre: await this.resolveTipoStock(movimiento.origen_stock_id),
              destinoId: movimiento.destino_stock_id,
              destinoNombre: await this.resolveTipoStock(movimiento.destino_stock_id),
              usuarioId: movimiento.usuario_id,
              usuarioNombre: await this.resolveUsuario(movimiento.usuario_id),
              fechaMovimiento: movimiento.fecha_movimiento,
              tipoMovimiento: this.mapTipoMovimiento(movimiento.tipo_movimiento),
              motivo: movimiento.motivo || 'Sin especificar',
              documentoReferencia: movimiento.documento_referencia || 'N/A',
              pedidoId: movimiento.pedido_id,
              pedidoCodigo: await this.resolvePedido(movimiento.pedido_id),
              // Campos para compatibilidad con el template existente
              observaciones: movimiento.motivo || 'Sin observaciones',
              tipoMovimientoBadge: this.mapTipoMovimiento(movimiento.tipo_movimiento)
            };
          })
        );
        
        // Ordenar por fecha descendente
        this.movimientos.sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));
        
      } catch (error) {
        this.showToast('Error al cargar historial de movimientos', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Cargar materiales para cache
    async loadMateriales() {
      try {
        const response = await axios.get('/api/MateriaPrima');
        response.data.forEach(material => {
          this.materialesCache[material.id] = material.nombre;
        });
      } catch (error) {
        // Fallback silencioso
      }
    },
    
    // Cargar unidades de medida para cache
    async loadUnidadesMedida() {
      try {
        const response = await axios.get('/api/Unidad_Medida');
        response.data.forEach(unidad => {
          this.unidadesMedidaCache[unidad.id] = unidad.nombre;
        });
      } catch (error) {
        // Fallback silencioso
      }
    },
    
    // Cargar tipos de stock para cache
    async loadTiposStock() {
      try {
        const response = await axios.get('/api/Tipo_Stock');
        response.data.forEach(tipo => {
          this.tiposStockCache[tipo.id] = tipo.nombre;
        });
      } catch (error) {
        // Fallback silencioso
      }
    },
    
    // Cargar usuarios para cache
    async loadUsuarios() {
      try {
        const response = await axios.get('/api/Usuario');
        response.data.forEach(usuario => {
          this.usuariosCache[usuario.id] = `${usuario.nombre} ${usuario.apellido}`.trim();
        });
      } catch (error) {
        // Fallback silencioso
      }
    },
    
    // Cargar pedidos para cache
    async loadPedidos() {
      try {
        const response = await axios.get('/api/Pedido');
        response.data.forEach(pedido => {
          this.pedidosCache[pedido.id] = pedido.codigo_pedido || `Pedido ${pedido.id}`;
        });
      } catch (error) {
        // Fallback silencioso
      }
    },
    
    // Resolvers para foreign keys
    async resolveMaterial(materialId) {
      if (!materialId) return 'Material no especificado';
      return this.materialesCache[materialId] || `Material ${materialId}`;
    },
    
    async resolveUnidadMedida(unidadId) {
      if (!unidadId) return 'unidad';
      return this.unidadesMedidaCache[unidadId] || 'unidad';
    },
    
    async resolveTipoStock(tipoId) {
      if (!tipoId) return 'Stock no especificado';
      return this.tiposStockCache[tipoId] || `Stock ${tipoId}`;
    },
    
    async resolveUsuario(usuarioId) {
      if (!usuarioId) return 'Usuario no especificado';
      return this.usuariosCache[usuarioId] || `Usuario ${usuarioId}`;
    },
    
    async resolvePedido(pedidoId) {
      if (!pedidoId) return 'Sin pedido';
      return this.pedidosCache[pedidoId] || `Pedido ${pedidoId}`;
    },
    
    // Mapear tipo de movimiento
    mapTipoMovimiento(tipoMovimiento) {
      const mapeo = {
        'entrada': 'Entrada',
        'salida': 'Salida',
        'transferencia': 'Transferencia',
        'ajuste': 'Ajuste',
        'devolucion': 'Devolución'
      };
      return mapeo[tipoMovimiento] || tipoMovimiento;
    },

    // Formatear fecha y hora
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    // Formatear moneda
    formatCurrency(value) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(value);
    },

    // Obtener clase de badge para tipo de movimiento
    getTipoMovimientoBadgeClass(tipo) {
      const classes = {
        'Entrada': 'tipo-entrada',
        'Salida': 'tipo-salida', 
        'Transferencia': 'tipo-transferencia',
        'Ajuste': 'tipo-ajuste',
        'Devolución': 'tipo-devolucion'
      };
      return `tipo-badge ${classes[tipo] || 'tipo-default'}`;
    },

    // Obtener clase de badge para estado
    getStatusBadgeClass(status) {
      const classes = {
        'Activo': 'badge-info',
        'Completado': 'badge-success',
        'Pendiente': 'badge-warning',
        'Vencido': 'badge-danger',
        'Cancelado': 'badge-secondary'
      };
      return `status-badge ${classes[status] || 'badge-secondary'}`;
    },

    // Acciones de la tabla
    viewDetails(movimiento) {
      this.selectedMovimiento = { ...movimiento };
      this.showDetailsModal = true;
    },

    exportMovimientos() {
      // La tabla de vue-good-table-next maneja la exportación automáticamente
      console.log('Exportando historial de movimientos...');
    },

    // Limpiar filtros
    clearFilters() {
      this.filtros = {
        tipoMovimiento: '',
        estado: '',
        departamento: '',
        usuario: '',
        proyecto: '',
        fechaInicio: '',
        fechaFin: '',
        herramienta: ''
      };
      this.searchTerm = '';
    },

    // Mostrar mensaje de éxito
    showSuccessMessage(message) {
      // Implementar sistema de notificaciones
      console.log('✅', message);
    },
    
    // Mostrar toast de notificación
    showToast(message, type = 'info') {
      // Implementar sistema de notificaciones toast
      console.log(`${type.toUpperCase()}: ${message}`);
    },

    // Calcular duración del préstamo
    calcularDuracionPrestamo(fechaInicio, fechaFin) {
      if (!fechaInicio || !fechaFin) return 'N/A';
      
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diffTime = Math.abs(fin - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Mismo día';
      if (diffDays === 1) return '1 día';
      return `${diffDays} días`;
    },

    // Determinar si un préstamo está vencido
    esPrestamoVencido(fechaMovimiento, estado) {
      if (estado === 'Completado' || estado === 'Cancelado') return false;
      
      const fechaLimite = new Date(fechaMovimiento);
      fechaLimite.setDate(fechaLimite.getDate() + 14); // 14 días de límite
      
      return new Date() > fechaLimite;
    }
  }
}
