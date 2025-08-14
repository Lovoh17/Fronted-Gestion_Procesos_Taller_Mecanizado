import axios from 'axios'
import WorkOrderModal from '../ComponentesCoordinador/WorkOrderModal.vue'
import NewWorkOrderWizardModal from '../ComponentesCoordinador/NewWorkOrderWizardModal.vue'

export default {
  name: 'WorkOrdersDashboard',
  
  components: {
    WorkOrderModal,
    NewWorkOrderWizardModal
  },
  
  data() {
    return {
      // Datos básicos
      orders: [],
      loading: false,
      loadingDelete: null,
      searchQuery: '',
      showFilters: true,
      viewMode: 'table',
      selectedOrder: null,
      showNewOrderModal: false,
      showOrderModal: false,
      showWizardModal: false,
      
      // Nuevo pedido para el modal
      newOrder: {
        id: null,
        codigo_pedido: '',
        tipo_pedido_id: null,
        prioridad: 3,
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        proyecto_asociado: '',
        costo_estimado: null,
        precio_final: null,
        trabajadores_asignados: [],
        herramientas_asignadas: [],
        materiales: [],
        planos: [],
        notas: '',
        estado_id: 1
      },
      
      // Filtros
      statusFilter: 'all',
      priorityFilter: 'all',
      clientFilter: 'all',
      assignedToFilter: 'all',
      dateRange: {
        start: '',
        end: ''
      },
      
      // Configuración de columnas para vue-good-table-next
      tableColumns: [
        {
          label: 'Código',
          field: 'codigo_pedido',
          type: 'string',
          sortable: true,
          width: '140px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por código'
          }
        },
        {
          label: 'Proyecto',
          field: 'proyecto_asociado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por proyecto'
          }
        },
        {
          label: 'Tipo',
          field: 'tipo_pedido_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por tipo'
          }
        },
        {
          label: 'Estado',
          field: 'status',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'pendiente', text: 'Pendiente' },
              { value: 'aprobado', text: 'Aprobado' },
              { value: 'en_proceso', text: 'En Proceso' },
              { value: 'pausado', text: 'Pausado' },
              { value: 'completado', text: 'Completado' },
              { value: 'cancelado', text: 'Cancelado' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Prioridad',
          field: 'priority',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'alta', text: 'Alta' },
              { value: 'media', text: 'Media' },
              { value: 'baja', text: 'Baja' }
            ],
            filterMultiselect: false,
            placeholder: 'Todas las prioridades'
          }
        },
        {
          label: 'Supervisor',
          field: 'supervisor_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por supervisor'
          }
        },
        {
          label: 'F. Solicitud',
          field: 'start_date',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'F. Requerida',
          field: 'end_date',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'Costo Est.',
          field: 'costo_estimado',
          type: 'number',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Progreso',
          field: 'progress',
          type: 'number',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '180px'
        }
      ]
    }
  },

  computed: {
    // Filtros aplicados
    filteredOrders() {
      return this.orders.filter(order => {
        // Filtro por estado
        const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
        
        // Filtro por prioridad
        const matchesPriority = this.priorityFilter === 'all' || order.priority === this.priorityFilter;
        
        // Filtro por proyecto
        const matchesClient = this.clientFilter === 'all' || 
          (order.proyecto_asociado && order.proyecto_asociado.toLowerCase().includes(this.clientFilter.toLowerCase()));
          
        // Filtro por supervisor
        const matchesAssigned = this.assignedToFilter === 'all' || 
          (order.supervisor_nombre && order.supervisor_nombre.toLowerCase().includes(this.assignedToFilter.toLowerCase()));
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
          (order.codigo_pedido && order.codigo_pedido.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (order.proyecto_asociado && order.proyecto_asociado.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (order.tipo_pedido_nombre && order.tipo_pedido_nombre.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (order.supervisor_nombre && order.supervisor_nombre.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (order.notas && order.notas.toLowerCase().includes(this.searchQuery.toLowerCase()));
          
        // Filtro por fecha
        const matchesDate = (!this.dateRange.start || new Date(order.start_date) >= new Date(this.dateRange.start)) &&
                          (!this.dateRange.end || new Date(order.end_date) <= new Date(this.dateRange.end));
        
        return matchesStatus && matchesPriority && matchesClient && matchesAssigned && matchesSearch && matchesDate;
      });
    },
    
    // Estadísticas para cards
    totalOrders() {
      return this.orders.length;
    },
    
    pendingOrders() {
      return this.orders.filter(order => order.status === 'pendiente').length;
    },
    
    inProgressOrders() {
      return this.orders.filter(order => order.status === 'en_proceso' || order.status === 'aprobado').length;
    },
    
    completedOrders() {
      return this.orders.filter(order => order.status === 'completado').length;
    },
    
    delayedOrders() {
      return this.orders.filter(order => order.status === 'pausado').length;
    },
    
    // Contadores de filtros activos
    hasActiveFilters() {
      return this.statusFilter !== 'all' ||
             this.priorityFilter !== 'all' ||
             this.clientFilter !== 'all' ||
             this.assignedToFilter !== 'all' ||
             this.dateRange.start !== '' ||
             this.dateRange.end !== '' ||
             this.searchQuery !== '';
    },
    
    activeFiltersCount() {
      let count = 0;
      if (this.statusFilter !== 'all') count++;
      if (this.priorityFilter !== 'all') count++;
      if (this.clientFilter !== 'all') count++;
      if (this.assignedToFilter !== 'all') count++;
      if (this.dateRange.start !== '') count++;
      if (this.dateRange.end !== '') count++;
      if (this.searchQuery !== '') count++;
      return count;
    }
  },

  methods: {
    // Métodos de carga de datos
    async loadOrders() {
      try {
        this.loading = true;
        
        // Cargar datos desde la API
        const response = await axios.get('/api/Pedido');
        const rawOrders = response.data;
        
        // Transformar datos de la API al formato esperado por la tabla
        this.orders = await Promise.all(rawOrders.map(async (order) => {
          return {
            ...order,
            // Mapear campos para la tabla
            status: this.mapEstadoIdToStatus(order.estado_id),
            priority: this.mapPrioridadToString(order.prioridad),
            start_date: order.fecha_solicitud ? order.fecha_solicitud.split('T')[0] : null,
            end_date: order.fecha_requerida,
            progress: this.calculateProgress(order),
            // Resolver nombres desde IDs
            tipo_pedido_nombre: await this.resolveTipoPedido(order.tipo_pedido_id),
            supervisor_nombre: await this.resolveUsuario(order.supervisor_id),
            // Formatear costos
            costo_estimado: parseFloat(order.costo_estimado) || 0,
            costo_real: parseFloat(order.costo_real) || 0,
            precio_final: parseFloat(order.precio_final) || 0
          };
        }));
        
      } catch (error) {
        this.showToast('Error al cargar órdenes de trabajo', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    // Métodos de mapeo y resolución de datos
    mapEstadoIdToStatus(estadoId) {
      const estadoMap = {
        1: 'pendiente',
        2: 'aprobado', 
        3: 'en_proceso',
        4: 'pausado',
        5: 'completado',
        6: 'cancelado'
      };
      return estadoMap[estadoId] || 'pendiente';
    },
    
    mapPrioridadToString(prioridad) {
      const prioridadMap = {
        1: 'alta',
        2: 'media', 
        3: 'baja'
      };
      return prioridadMap[prioridad] || 'media';
    },
    
    calculateProgress(order) {
      // Calcular progreso basado en el estado y fechas
      if (order.estado_id === 5) return 100; // Completado
      if (order.estado_id === 6) return 0;   // Cancelado
      if (order.estado_id === 1) return 0;   // Pendiente
      
      // Para estados en progreso, calcular basado en fechas
      if (order.fecha_solicitud && order.fecha_requerida) {
        const inicio = new Date(order.fecha_solicitud);
        const fin = new Date(order.fecha_requerida);
        const ahora = new Date();
        
        if (ahora < inicio) return 0;
        if (ahora > fin) return 100;
        
        const totalTime = fin - inicio;
        const elapsedTime = ahora - inicio;
        return Math.min(Math.round((elapsedTime / totalTime) * 100), 95);
      }
      
      // Progreso por defecto según estado
      const defaultProgress = {
        2: 25,  // Aprobado
        3: 50,  // En proceso
        4: 30   // Pausado
      };
      
      return defaultProgress[order.estado_id] || 0;
    },
    
    async resolveTipoPedido(tipoId) {
      const tipos = {
        1: 'Suministros',
        2: 'Equipamiento', 
        3: 'Servicios',
        4: 'Mantenimiento',
        5: 'Reparación'
      };
      return tipos[tipoId] || `Tipo ${tipoId}`;
    },
    
    async resolveUsuario(usuarioId) {
      if (!usuarioId) return 'Sin asignar';
      
      try {
        const response = await axios.get(`/api/Usuario/${usuarioId}`);
        const usuario = response.data;
        return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || `Usuario ${usuarioId}`;
      } catch (error) {
        return `Usuario ${usuarioId}`;
      }
    },
    
    // Métodos de UI
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    applyFilters() {
      // Los filtros se aplican automáticamente via computed
      this.showToast('Filtros aplicados', 'success');
    },
    
    resetFilters() {
      this.statusFilter = 'all';
      this.priorityFilter = 'all';
      this.clientFilter = 'all';
      this.assignedToFilter = 'all';
      this.searchQuery = '';
      this.dateRange = { start: '', end: '' };
      this.showToast('Filtros restablecidos', 'success');
    },
    
    // Métodos de acciones
    viewOrder(order) {
      this.selectedOrder = { ...order };
      this.showOrderModal = true;
      // Aquí puedes abrir un modal o navegar a vista detalle
    },
    
    editOrder(order) {
      this.selectedOrder = { ...order };
      this.showOrderModal = true;
      // Implementar lógica de edición
    },
    
    async completeOrder(order) {
      if (confirm('¿Está seguro de marcar esta orden como completada?')) {
        try {
          // Actualizar en la API
          await axios.patch(`/api/Pedido/${order.id}`, {
            estado_id: 5, // Estado completado
            fecha_completado: new Date().toISOString()
          });
          
          // Actualizar localmente
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index].status = 'completado';
            this.orders[index].estado_id = 5;
            this.orders[index].progress = 100;
            this.orders[index].fecha_completado = new Date().toISOString();
          }
          
          this.showToast('Orden marcada como completada', 'success');
        } catch (error) {
          this.showToast('Error al completar la orden', 'error');
        }
      }
    },
    
    async deleteOrder(orderId) {
      if (confirm('¿Está seguro de que desea eliminar esta orden de trabajo?')) {
        try {
          this.loadingDelete = orderId;
          
          // Eliminar en la API
          await axios.delete(`/api/Pedido/${orderId}`);
          
          // Eliminar localmente
          this.orders = this.orders.filter(o => o.id !== orderId);
          this.showToast('Orden eliminada correctamente', 'success');
        } catch (error) {
          this.showToast('Error al eliminar la orden', 'error');
        } finally {
          this.loadingDelete = null;
        }
      }
    },
    
    // Métodos de formato
    formatStatus(status) {
      const statuses = {
        'pendiente': 'Pendiente',
        'aprobado': 'Aprobado',
        'en_proceso': 'En Proceso',
        'pausado': 'Pausado',
        'completado': 'Completado',
        'cancelado': 'Cancelado'
      };
      return statuses[status] || status;
    },
    
    statusClass(status) {
      return {
        'pendiente': 'badge-warning',
        'aprobado': 'badge-info',
        'en_proceso': 'badge-primary',
        'pausado': 'badge-danger',
        'completado': 'badge-success',
        'cancelado': 'badge-secondary'
      }[status] || 'badge-light';
    },
    
    formatPriority(priority) {
      const priorities = {
        'baja': 'Baja',
        'media': 'Media', 
        'alta': 'Alta'
      };
      return priorities[priority] || priority;
    },
    
    priorityClass(priority) {
      return {
        'baja': 'badge-secondary',
        'media': 'badge-info',
        'alta': 'badge-danger'
      }[priority] || 'badge-light';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    formatCurrency(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '$0.00'; 
      }
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    },
    
    // Método para exportar
    exportToCSV() {
      try {
        if (this.$refs.vueGoodTable) {
          const fileName = `ordenes_trabajo_${new Date().toISOString().split('T')[0]}.csv`;
          this.$refs.vueGoodTable.exportCsv(fileName);
          this.showToast('Tabla exportada exitosamente', 'success');
        } else {
          this.showToast('Error al exportar: tabla no encontrada', 'error');
        }
      } catch (error) {
        this.showToast('Error al exportar tabla', 'error');
      }
    },
    
    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      // Aquí puedes integrar tu sistema de notificaciones
      alert(`${type.toUpperCase()}: ${message}`);
    },
    
    // =========== MÉTODOS DEL MODAL DE NUEVA ORDEN ===========
    
    // Abrir modal para nueva orden
    openNewOrderModal() {
      this.resetNewOrder();
      this.showNewOrderModal = true;
    },
    
    // Cerrar modal de nueva orden
    closeNewOrderModal() {
      this.showNewOrderModal = false;
      this.resetNewOrder();
    },
    
    // Resetear los datos del nuevo pedido
    resetNewOrder() {
      this.newOrder = {
        id: null,
        codigo_pedido: this.generateOrderCode(),
        tipo_pedido_id: null,
        prioridad: 3,
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        proyecto_asociado: '',
        costo_estimado: null,
        precio_final: null,
        trabajadores_asignados: [],
        herramientas_asignadas: [],
        materiales: [],
        planos: [],
        notas: '',
        estado_id: 1
      };
    },
    
    // Generar código automático para la nueva orden
    generateOrderCode() {
      const currentYear = new Date().getFullYear();
      const orderCount = this.orders.length + 1;
      return `OT-${currentYear}-${String(orderCount).padStart(3, '0')}`;
    },
    
    // Guardar nueva orden
    async saveNewOrder(orderData) {
      try {
        
        // Crear nueva orden con datos del modal
        const newWorkOrder = {
          id: this.generateOrderCode(),
          client_name: 'Cliente por definir', // Esto debería venir del formulario
          description: orderData.notas || 'Nueva orden de trabajo',
          status: 'pending',
          priority: this.mapPriorityToString(orderData.prioridad),
          assigned_to_name: this.getAssignedWorkersNames(orderData.trabajadores_asignados),
          start_date: new Date().toISOString().split('T')[0],
          end_date: orderData.fecha_requerida,
          progress: 0,
          estimated_hours: 0,
          materials_cost: orderData.costo_estimado || 0,
          labor_cost: 0,
          notes: orderData.notas || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Datos específicos del pedido
          codigo_pedido: orderData.codigo_pedido,
          tipo_pedido_id: orderData.tipo_pedido_id,
          proyecto_asociado: orderData.proyecto_asociado,
          precio_final: orderData.precio_final,
          trabajadores_asignados: orderData.trabajadores_asignados,
          herramientas_asignadas: orderData.herramientas_asignadas,
          materiales: orderData.materiales,
          planos: orderData.planos
        };
        
        // En producción, aquí harías una llamada a la API:
        // const response = await axios.post('/api/work-orders', newWorkOrder);
        // const savedOrder = response.data;
        
        // Agregar a la lista local
        this.orders.unshift(newWorkOrder);
        
        // Cerrar modal y mostrar mensaje de éxito
        this.closeNewOrderModal();
        this.showToast('Orden de trabajo creada exitosamente', 'success');
        
      } catch (error) {
        this.showToast('Error al crear la orden de trabajo', 'error');
      }
    },
    
    // Mapear prioridad numérica a string
    mapPriorityToString(prioridadNum) {
      const priorityMap = {
        1: 'urgent',
        2: 'high', 
        3: 'medium',
        4: 'medium',
        5: 'low'
      };
      return priorityMap[prioridadNum] || 'medium';
    },
    
    // Obtener nombres de trabajadores asignados
    getAssignedWorkersNames(trabajadorIds) {
      if (!trabajadorIds || trabajadorIds.length === 0) {
        return 'Sin asignar';
      }
      // En una implementación real, buscarías los nombres en una lista de trabajadores
      return `${trabajadorIds.length} trabajador(es) asignado(s)`;
    },
    
    // =========== MÉTODOS DEL WIZARD MODAL ===========
    
    // Abrir el wizard modal
    openWizardModal() {
      this.showWizardModal = true;
    },
    
    // Cerrar el wizard modal
    onWizardClose() {
      this.showWizardModal = false;
    },
    
    // Manejar el guardado desde el wizard
    async onOrderSave(orderData) {
      try {
        
        // Mapear los datos del wizard al formato de la tabla
        const newWorkOrder = {
          id: orderData.codigo_pedido || this.generateOrderCode(),
          client_name: this.extractClientFromOrderData(orderData),
          description: orderData.notas || orderData.especificaciones_adicionales || 'Nueva orden creada desde wizard',
          status: this.mapWizardStatusToTableStatus(orderData.estado || orderData.action),
          priority: this.mapWizardPriorityToString(orderData.prioridad),
          assigned_to_name: this.getAssignedTechniciansNames(orderData.tecnicos_asignados),
          start_date: this.getFechaInicioFromOrderData(orderData),
          end_date: orderData.fecha_requerida || new Date().toISOString().split('T')[0],
          progress: 0,
          estimated_hours: this.calculateTotalHours(orderData.tecnicos_asignados),
          materials_cost: orderData.costo_materiales || 0,
          labor_cost: orderData.costo_mano_obra || 0,
          notes: orderData.notas || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Datos específicos del wizard
          codigo_pedido: orderData.codigo_pedido,
          tipo_pedido_id: orderData.tipo_pedido_id,
          proyecto_asociado: orderData.proyecto_asociado,
          precio_final: orderData.precio_final,
          supervisor_id: orderData.supervisor_id,
          plano_seleccionado: orderData.plano_seleccionado,
          costo_total_estimado: orderData.costo_total_estimado,
          herramientas_sugeridas: orderData.herramientas_sugeridas,
          materiales_sugeridos: orderData.materiales_sugeridos
        };
        
        // En producción, aquí harías una llamada a la API:
        // const response = await axios.post('/api/work-orders', newWorkOrder);
        // const savedOrder = response.data;
        
        // Agregar a la lista local
        this.orders.unshift(newWorkOrder);
        
        // Mostrar mensaje de éxito según la acción
        if (orderData.action === 'send_for_approval') {
          this.showToast('Pedido enviado para aprobación exitosamente', 'success');
        } else if (orderData.action === 'create_immediately') {
          this.showToast('Pedido creado inmediatamente con éxito', 'success');
        } else {
          this.showToast('Orden de trabajo creada exitosamente', 'success');
        }
        
      } catch (error) {
        this.showToast('Error al crear la orden de trabajo', 'error');
      }
    },
    
    // Manejar el guardado de borrador
    onDraftSaved(draftData) {
      this.showToast('Borrador guardado exitosamente', 'info');
    },
    
    // Métodos auxiliares para el wizard
    extractClientFromOrderData(orderData) {
      // En el wizard no hay campo específico de cliente, 
      // podríamos extraerlo del proyecto o usar un valor por defecto
      if (orderData.proyecto_asociado) {
        return `Cliente de ${orderData.proyecto_asociado}`;
      }
      return 'Cliente por definir';
    },
    
    mapWizardStatusToTableStatus(wizardAction) {
      const statusMap = {
        'send_for_approval': 'pending',
        'create_immediately': 'pending',
        'Pendiente Aprobación': 'pending',
        'Aprobado': 'pending'
      };
      return statusMap[wizardAction] || 'pending';
    },
    
    mapWizardPriorityToString(prioridadNum) {
      const priorityMap = {
        1: 'urgent',
        2: 'high', 
        3: 'medium'
      };
      return priorityMap[prioridadNum] || 'medium';
    },
    
    getAssignedTechniciansNames(tecnicosAsignados) {
      if (!tecnicosAsignados || tecnicosAsignados.length === 0) {
        return 'Sin asignar';
      }
      
      // Filtrar técnicos que tienen ID asignado
      const validTechnicians = tecnicosAsignados.filter(t => t.tecnico_id);
      
      if (validTechnicians.length === 0) {
        return 'Sin asignar';
      }
      
      if (validTechnicians.length === 1) {
        return `Técnico ID: ${validTechnicians[0].tecnico_id}`;
      }
      
      return `${validTechnicians.length} técnicos asignados`;
    },
    
    calculateTotalHours(tecnicosAsignados) {
      if (!tecnicosAsignados || tecnicosAsignados.length === 0) {
        return 0;
      }
      
      return tecnicosAsignados.reduce((total, tecnico) => {
        return total + (parseFloat(tecnico.horas_asignadas) || 0);
      }, 0);
    },
    
    getFechaInicioFromOrderData(orderData) {
      // Calcular fecha de inicio basada en la fecha requerida
      // Por defecto, iniciar 7 días antes de la fecha requerida
      if (orderData.fecha_requerida) {
        const fechaRequerida = new Date(orderData.fecha_requerida);
        const fechaInicio = new Date(fechaRequerida);
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        return fechaInicio.toISOString().split('T')[0];
      }
      
      return new Date().toISOString().split('T')[0];
    }
  },

  mounted() {
    this.loadOrders();
  }
}
