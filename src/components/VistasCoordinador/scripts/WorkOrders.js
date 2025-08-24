import { VueGoodTable } from 'vue-good-table-next';
import 'vue-good-table-next/dist/vue-good-table-next.css';
import AsignarPedidosModal from '../ComponentesCoordinador/AsignacionTrabajosModal.vue';
import PedidoDetalleModal from '../ComponentesCoordinador/OrderDetailsModal.vue';
import PedidoEditarModal from '../ComponentesCoordinador/EditOrdersModal.vue';

export default {
  name: 'ListadoPedidos',
  components: {
    VueGoodTable,
    PedidoDetalleModal,
    PedidoEditarModal,
    AsignarPedidosModal
  },
  data() {
    return {
      pedidos: [],
      loading: false,
      searchTerm: '',
      filtroEstado: '',
      filtroPrioridad: '',
      itemsPorPagina: 10,
      pedidoSeleccionado: null,
      modalMode: null,
      horasAsignadas: 8,
      
      // Variables para el modal de asignación
      showAsignarModal: false,
      pedidosDisponibles: [],
      usuarios: [],
      loadingUsuarios: false,
      
      estados: [
        { id: 1, nombre: 'Borrador' },
        { id: 2, nombre: 'Pendiente Aprobación' },
        { id: 3, nombre: 'Aprobado' },
        { id: 4, nombre: 'En Proceso' },
        { id: 5, nombre: 'Completado' },
        { id: 6, nombre: 'Cancelado' }
      ],
      tiposPedido: [
        { id: 1, nombre: 'Manufactura' },
        { id: 2, nombre: 'Mantenimiento' },
        { id: 3, nombre: 'Instalación' },
        { id: 4, nombre: 'Reparación' },
        { id: 5, nombre: 'Modificación' },
        { id: 6, nombre: 'Otros' }
      ],
      columns: [
        {
          label: 'Código',
          field: 'codigo_pedido',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Tipo',
          field: 'tipo_pedido_id',
          sortable: true,
          sortFn: (x, y, col, rowX, rowY) => {
            const tipoX = this.getTipoPedidoName(x);
            const tipoY = this.getTipoPedidoName(y);
            return tipoX.localeCompare(tipoY);
          }
        },
        {
          label: 'Solicitante',
          field: 'solicitante',
          sortable: true,
          sortFn: (x, y, col, rowX, rowY) => {
            const nombreX = `${rowX.solicitante?.nombres || ''} ${rowX.solicitante?.apellidos || ''}`;
            const nombreY = `${rowY.solicitante?.nombres || ''} ${rowY.solicitante?.apellidos || ''}`;
            return nombreX.localeCompare(nombreY);
          }
        },
        {
          label: 'Fecha Requerida',
          field: 'fecha_requerida',
          sortable: true,
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          width: '140px'
        },
        {
          label: 'Prioridad',
          field: 'prioridad',
          sortable: true,
          sortFn: (x, y) => parseInt(x) - parseInt(y),
          width: '120px'
        },
        {
          label: 'Estado',
          field: 'estado_id',
          sortable: true,
          sortFn: (x, y, col, rowX, rowY) => {
            const estadoX = this.getStatusName(x);
            const estadoY = this.getStatusName(y);
            return estadoX.localeCompare(estadoY);
          },
          width: '160px'
        },
        {
          label: 'Precio',
          field: 'precio_final',
          sortable: true,
          type: 'decimal',
          width: '120px'
        },
        {
          label: 'Acciones',
          field: 'acciones',
          sortable: false,
          width: '140px'
        }
      ]
    }
  },
  computed: {
    formularioValido() {
      return this.pedidosSeleccionados.length > 0 && 
             this.usuariosAsignados.length > 0 &&
             this.fechaLimite &&
             this.horasAsignadas > 0;
    },
    estadisticas() {
      const total = this.pedidos.length
      const pendientes = this.pedidos.filter(p => p.estado_id === 2).length
      const enProceso = this.pedidos.filter(p => p.estado_id === 4).length
      const completados = this.pedidos.filter(p => p.estado_id === 5).length

      return [
        {
          icon: 'assignment',
          label: 'Total Pedidos',
          value: total,
          color: 'blue'
        },
        {
          icon: 'schedule',
          label: 'Pendientes',
          value: pendientes,
          color: 'orange'
        },
        {
          icon: 'build',
          label: 'En Proceso',
          value: enProceso,
          color: 'purple'
        },
        {
          icon: 'check_circle',
          label: 'Completados',
          value: completados,
          color: 'green'
        }
      ]
    },
    
    totalPedidos() {
      return this.pedidos.length;
    }
  },
  mounted() {
    this.cargarPedidos()
    this.cargarTiposPedido()
  },
  methods: {
    async cargarPedidos() {
      this.loading = true
      try {
        const response = await fetch('/api/Pedido', {
          /*headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }*/
        })
        
        if (!response.ok) {
          throw new Error('Error al cargar los pedidos')
        }
        
        const data = await response.json()
        
        // Si la API devuelve datos paginados
        if (data.data && data.total !== undefined) {
          this.pedidos = data.data
        } else {
          // Si la API devuelve array simple
          this.pedidos = data
        }
        
      } catch (error) {
        console.error('Error:', error)
        this.showError('No se pudieron cargar los pedidos')
      } finally {
        this.loading = false
      }
    },
    
    async cargarTiposPedido() {
      try {
        const response = await fetch('/api/Tipo_Pedido', {
          /*headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }*/
        })
        
        if (response.ok) {
          this.tiposPedido = await response.json()
        }
      } catch (error) {
        console.error('Error al cargar tipos de pedido:', error)
      }
    },
    
    async cargarUsuarios() {
      this.loadingUsuarios = true
      try {
        const response = await fetch('/api/Usuario/Puesto/3', {
          /*headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }*/
        })
        
        if (!response.ok) {
          throw new Error('Error al cargar usuarios')
        }
        
        const data = await response.json()
        this.usuarios = data
        
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        this.showError('No se pudieron cargar los usuarios')
        this.usuarios = []
      } finally {
        this.loadingUsuarios = false
      }
    },
    
    cargarPedidosDisponibles() {
      // Filtrar pedidos que pueden ser asignados (estados 2 y 3: Pendiente Aprobación y Aprobado)
      this.pedidosDisponibles = this.pedidos.filter(pedido => 
        pedido.estado_id === 2 || pedido.estado_id === 3
      )
    },
    
    async abrirModalAsignar() {
      this.cargarPedidosDisponibles()
      await this.cargarUsuarios()
      this.showAsignarModal = true
    },
    
    cerrarModalAsignar() {
      this.showAsignarModal = false
    },
    
    async onAsignacionConfirmada(asignacionData) {
      // Solo recargar pedidos cuando el modal emita éxito
      this.cargarPedidos();
      this.showSuccess('Asignación completada');
    },
    
    actualizarDatos() {
      this.cargarPedidos()
      this.showSuccess('Datos actualizados correctamente')
    },
    
    nuevoPedido() {
      this.$router.push('/pedidos/nuevo')
    },
    
    verDetalles(pedido) {
      this.pedidoSeleccionado = pedido
      this.modalMode = 'detalle'
    },
    
    editarPedido(pedido) {
      this.pedidoSeleccionado = pedido
      this.modalMode = 'edicion'
    },
    
    cerrarModal() {
      this.pedidoSeleccionado = null
      this.modalMode = null
    },
    
    onPedidoGuardado() {
      this.cerrarModal()
      this.cargarPedidos()
      this.showSuccess('Pedido actualizado correctamente')
    },
    
    async eliminarPedido(pedido) {
      if (!confirm(`¿Estás seguro de eliminar el pedido ${pedido.codigo_pedido}?`)) {
        return
      }
      
      try {
        const response = await fetch(`/api/Pedido/${pedido.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          this.showSuccess('Pedido eliminado correctamente')
          this.cargarPedidos()
        } else {
          throw new Error('Error al eliminar el pedido')
        }
      } catch (error) {
        console.error('Error:', error)
        this.showError('No se pudo eliminar el pedido')
      }
    },
    
    getTipoPedidoName(tipoId) {
      const tipo = this.tiposPedido.find(t => t.id === tipoId)
      return tipo ? tipo.nombre : 'N/A'
    },
    
    getPriorityName(priority) {
      const priorityMap = {
        '1': 'Alta',
        '2': 'Media-Alta',
        '3': 'Media',
        '4': 'Media-Baja',
        '5': 'Baja'
      }
      return priorityMap[priority] || 'Media'
    },
    
    getStatusName(estadoId) {
      const estado = this.estados.find(e => e.id === estadoId)
      return estado ? estado.nombre : 'Desconocido'
    },
    
    getStatusClass(estadoId) {
      const statusClasses = {
        1: 'draft',
        2: 'pending',
        3: 'approved',
        4: 'in-progress',
        5: 'completed',
        6: 'cancelled'
      }
      return statusClasses[estadoId] || 'unknown'
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-GT')
    },
    
    showError(message) {
      // En una aplicación real, usar un sistema de notificaciones más sofisticado
      alert('Error: ' + message)
    },
    
    showSuccess(message) {
      // En una aplicación real, usar un sistema de notificaciones más sofisticado
      alert('Éxito: ' + message)
    }
  }
}