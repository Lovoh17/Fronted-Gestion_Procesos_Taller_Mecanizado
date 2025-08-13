import api from '@/api.js'

export const MovementsTableMixin = {
  data() {
    return {
      // Datos de movimientos
      movements: [],
      loadingMovements: false,

      units: {
        1: { nombre: 'metros', abreviatura: 'm' },
        2: { nombre: 'litros', abreviatura: 'l' },
        3: { nombre: 'kilogramos', abreviatura: 'kg' }
      },
      
      // Configuración de columnas para tabla de movimientos
      movementsColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'string',
          sortable: true,
          width: '60px'
        },
        {
          label: 'Fecha',
          field: 'fecha_movimiento_formatted',
          type: 'string',
          sortable: true,
          width: '130px',
          sortFn: (x, y, col, rowX, rowY) => {
            // Ordenar por la fecha original
            return new Date(rowX.fecha_movimiento) - new Date(rowY.fecha_movimiento)
          }
        },
        {
          label: 'Material ID',
          field: 'material_id',
          type: 'string',
          sortable: true,
          width: '100px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por material'
          }
        },
        {
          label: 'Tipo Movimiento',
          field: 'tipo_movimiento',
          type: 'string',
          sortable: true,
          width: '130px',
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Entrada', text: 'Entrada' },
              { value: 'Salida', text: 'Salida' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos'
          }
        },
        {
          label: 'Cantidad',
          field: 'cantidad_display',
          type: 'string',
          sortable: true,
          width: '100px',
          sortFn: (x, y, col, rowX, rowY) => {
            return Number(rowX.cantidad) - Number(rowY.cantidad)
          }
        },
        {
          label: 'Unidad',
          field: 'unidad_medida_display',
          type: 'string',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Origen',
          field: 'origen_stock_id',
          type: 'string',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Destino',
          field: 'destino_stock_id',
          type: 'string',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Motivo',
          field: 'motivo',
          type: 'string',
          sortable: true,
          width: '200px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por motivo'
          }
        },
        {
          label: 'Documento',
          field: 'documento_referencia',
          type: 'string',
          sortable: true,
          width: '150px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por documento'
          }
        },
        {
          label: 'Usuario ID',
          field: 'usuario_id',
          type: 'string',
          sortable: true,
          width: '100px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por usuario'
          }
        },
        {
          label: 'Pedido ID',
          field: 'pedido_id',
          type: 'string',
          sortable: true,
          width: '100px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por pedido'
          }
        },
        {
          label: 'Acciones',
          field: 'actions',
          type: 'string',
          sortable: false,
          width: '80px',
          thClass: 'text-center',
          tdClass: 'text-center'
        }
      ]
    }
  },

  methods: {
    // =========== MÉTODOS DE CARGA DE DATOS ===========
    
    // Cargar movimientos de inventario
    async fetchMovements() {
      this.loadingMovements = true
      try {
        // Llamada real a la API para obtener movimientos de inventario
        const rawMovements = await api.get('/Historial_Movimiento_Stock')
        
        // Procesar los datos para agregar campos calculados para la tabla
        this.movements = rawMovements.map(movement => {
          return {
            ...movement,
            // Campo calculado para mostrar cantidad con unidad
            cantidad_display: `${movement.cantidad} ${this.getUnitName(movement.unidad_medida_id)}`,
            // Campo calculado para mostrar unidad de medida
            unidad_medida_display: this.getUnitName(movement.unidad_medida_id),
            // Formatear fecha para mejor visualización
            fecha_movimiento_formatted: new Date(movement.fecha_movimiento).toLocaleString('es-ES')
          }
        })
        
        console.log('Movimientos cargados:', this.movements.length)
      } catch (error) {
        console.error('Error al cargar movimientos:', error)
        this.showToast('Error al cargar movimientos', 'error')
      } finally {
        this.loadingMovements = false
      }
    },
    
    // =========== MÉTODOS AUXILIARES ===========
    
    // Obtener nombre de unidad
    getUnitName(unitId) {
      return this.units[unitId]?.abreviatura || 'unid.'
    },
    
    // Formatear tipo de movimiento para mostrar
    getMovementTypeDisplay(type) {
      const types = {
        'entrada': 'Entrada',
        'salida': 'Salida',
        'ajuste': 'Ajuste',
        'transferencia': 'Transferencia'
      }
      return types[type] || type
    },
    
    // Obtener clase CSS para el tipo de movimiento
    getMovementTypeClass(type) {
      const classes = {
        'entrada': 'movement-entry',
        'salida': 'movement-exit'
      }
      return classes[type] || 'movement-entry' // Por defecto entrada
    },
    
    // =========== MÉTODOS DE EXPORTACIÓN ===========
    
    // Exportar movimientos a CSV
    exportMovementsToCSV() {
      try {
        if (this.$refs.vueGoodTableMovements) {
          const fileName = `movimientos_inventario_${new Date().toISOString().split('T')[0]}.csv`
          this.$refs.vueGoodTableMovements.exportCsv(fileName)
          this.showToast('Movimientos exportados exitosamente', 'success')
        } else {
          this.showToast('Error al exportar: tabla de movimientos no encontrada', 'error')
        }
      } catch (error) {
        console.error('Error exportando movimientos:', error)
        this.showToast('Error al exportar movimientos', 'error')
      }
    },

    // Generar CSV personalizado para movimientos
    generateMovementsCSV() {
      const headers = [
        'ID', 
        'Fecha', 
        'Material ID', 
        'Tipo Movimiento', 
        'Cantidad', 
        'Unidad', 
        'Origen', 
        'Destino', 
        'Motivo', 
        'Documento', 
        'Usuario ID', 
        'Pedido ID'
      ]
      
      const rows = this.movements.map(movement => [
        movement.id,
        movement.fecha_movimiento_formatted,
        movement.material_id,
        movement.tipo_movimiento,
        movement.cantidad,
        movement.unidad_medida_display,
        movement.origen_stock_id,
        movement.destino_stock_id,
        movement.motivo,
        movement.documento_referencia,
        movement.usuario_id,
        movement.pedido_id || 'N/A'
      ])

      return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    },

    // Descargar CSV de movimientos
    downloadMovementsCSV() {
      const csvContent = this.generateMovementsCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `movimientos_inventario_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }
}
