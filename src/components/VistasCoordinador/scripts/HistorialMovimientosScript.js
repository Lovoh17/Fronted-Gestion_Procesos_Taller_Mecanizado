import { VueGoodTable } from 'vue-good-table-next';

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
          label: 'Tipo Movimiento',
          field: 'tipoMovimiento',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Préstamo', text: 'Préstamo' },
              { value: 'Devolución', text: 'Devolución' },
              { value: 'Transferencia', text: 'Transferencia' },
              { value: 'Mantenimiento', text: 'Mantenimiento' },
              { value: 'Reparación', text: 'Reparación' }
            ]
          }
        },
        {
          label: 'Herramienta',
          field: 'herramienta',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por herramienta...'
          }
        },
        {
          label: 'Usuario',
          field: 'usuario',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por usuario...'
          }
        },
        {
          label: 'Departamento',
          field: 'departamento',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Producción', text: 'Producción' },
              { value: 'Mantenimiento', text: 'Mantenimiento' },
              { value: 'Control de Calidad', text: 'Control de Calidad' },
              { value: 'Ingeniería', text: 'Ingeniería' },
              { value: 'Almacén', text: 'Almacén' }
            ]
          }
        },
        {
          label: 'Proyecto',
          field: 'proyecto',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por proyecto...'
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
          label: 'Fecha Devolución',
          field: 'fechaDevolucion',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd HH:mm:ss',
          dateOutputFormat: 'dd/MM/yyyy HH:mm',
          sortable: true,
          filterOptions: {
            enabled: true
          }
        },
        {
          label: 'Estado',
          field: 'estado',
          type: 'text',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Activo', text: 'Activo' },
              { value: 'Completado', text: 'Completado' },
              { value: 'Pendiente', text: 'Pendiente' },
              { value: 'Vencido', text: 'Vencido' },
              { value: 'Cancelado', text: 'Cancelado' }
            ]
          }
        },
        {
          label: 'Horas Uso',
          field: 'horasUso',
          type: 'number',
          sortable: true,
          width: '100px'
        },
        {
          label: 'Costo',
          field: 'costo',
          type: 'number',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Acciones',
          field: 'acciones',
          sortable: false,
          width: '150px'
        }
      ],

      // Datos mock para demostración
      movimientos: this.generateMockData(),

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
      const prestamos = this.movimientos.filter(m => m.tipoMovimiento === 'Préstamo').length;
      const devoluciones = this.movimientos.filter(m => m.tipoMovimiento === 'Devolución').length;
      const activos = this.movimientos.filter(m => m.estado === 'Activo').length;
      const completados = this.movimientos.filter(m => m.estado === 'Completado').length;
      const vencidos = this.movimientos.filter(m => m.estado === 'Vencido').length;
      
      const totalHoras = this.movimientos.reduce((sum, m) => sum + m.horasUso, 0);
      const totalCosto = this.movimientos.reduce((sum, m) => sum + m.costo, 0);

      return {
        total,
        prestamos,
        devoluciones,
        activos,
        completados,
        vencidos,
        totalHoras: totalHoras.toFixed(1),
        totalCosto: totalCosto.toFixed(2)
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

  methods: {
    // Generar datos mock
    generateMockData() {
      const tiposMovimiento = ['Préstamo', 'Devolución', 'Transferencia', 'Mantenimiento', 'Reparación'];
      const estados = ['Activo', 'Completado', 'Pendiente', 'Vencido', 'Cancelado'];
      const departamentos = ['Producción', 'Mantenimiento', 'Control de Calidad', 'Ingeniería', 'Almacén'];
      
      const herramientas = [
        'Torno CNC Haas ST-20',
        'Fresadora CNC Mazak VTC-20C',
        'Centro de Mecanizado Doosan DNM 400',
        'Rectificadora Cylindrical Jones & Shipman',
        'Prensa Hidráulica 100T',
        'Sierra de Cinta DoALL C-320SA',
        'Taladro Radial WMW BR40x1000',
        'Soldadora TIG Miller Dynasty 350',
        'Compresor Atlas Copco GA22',
        'Grúa Puente 5T Demag',
        'Esmeriladora Pedestal Baldor',
        'Banco de Trabajo Hidráulico',
        'Micrómetro Digital Mitutoyo',
        'Calibre Pie de Rey Starrett',
        'Martillo Neumático Chicago',
        'Taladro de Columna Jet'
      ];
      
      const usuarios = [
        'Carlos Mendoza',
        'Ana García',
        'Roberto Silva',
        'María López',
        'José Rodríguez',
        'Elena Martín',
        'Miguel Torres',
        'Carmen Ruiz',
        'David Fernández',
        'Laura Jiménez',
        'Antonio Morales',
        'Isabel Santos'
      ];

      const proyectos = [
        'Proyecto Alpha - Componentes Automotriz',
        'Proyecto Beta - Piezas Aeronáuticas',
        'Proyecto Gamma - Maquinaria Industrial',
        'Proyecto Delta - Equipos Médicos',
        'Proyecto Epsilon - Componentes Navales',
        'Proyecto Zeta - Herramientas de Precisión',
        'Proyecto Eta - Moldes y Matrices',
        'Proyecto Theta - Prototipos de Investigación'
      ];

      const movimientos = [];
      
      for (let i = 1; i <= 75; i++) {
        const fechaBase = new Date();
        fechaBase.setDate(fechaBase.getDate() - Math.floor(Math.random() * 90));
        
        const tipoMovimiento = tiposMovimiento[Math.floor(Math.random() * tiposMovimiento.length)];
        const estado = estados[Math.floor(Math.random() * estados.length)];
        const departamento = departamentos[Math.floor(Math.random() * departamentos.length)];
        
        // Determinar fecha de devolución basada en el tipo y estado
        let fechaDevolucion = null;
        if (tipoMovimiento === 'Devolución' || estado === 'Completado') {
          fechaDevolucion = new Date(fechaBase);
          fechaDevolucion.setDate(fechaDevolucion.getDate() + Math.floor(Math.random() * 14) + 1);
        }

        // Calcular horas de uso y costo
        const horasUso = tipoMovimiento === 'Préstamo' ? Math.floor(Math.random() * 48) + 1 : 0;
        const costoPorHora = Math.floor(Math.random() * 50) + 10;
        const costo = horasUso * costoPorHora;

        movimientos.push({
          id: i,
          tipoMovimiento,
          herramienta: herramientas[Math.floor(Math.random() * herramientas.length)],
          usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
          departamento,
          proyecto: proyectos[Math.floor(Math.random() * proyectos.length)],
          fechaMovimiento: fechaBase.toISOString(),
          fechaDevolucion: fechaDevolucion ? fechaDevolucion.toISOString() : null,
          estado,
          horasUso,
          costo,
          observaciones: `Observaciones del movimiento ${i}`,
          aprobadoPor: usuarios[Math.floor(Math.random() * usuarios.length)],
          ubicacionOrigen: departamento,
          ubicacionDestino: departamentos[Math.floor(Math.random() * departamentos.length)]
        });
      }

      return movimientos.sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));
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
        'Préstamo': 'tipo-prestamo',
        'Devolución': 'tipo-devolucion',
        'Transferencia': 'tipo-transferencia',
        'Mantenimiento': 'tipo-mantenimiento',
        'Reparación': 'tipo-reparacion'
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
