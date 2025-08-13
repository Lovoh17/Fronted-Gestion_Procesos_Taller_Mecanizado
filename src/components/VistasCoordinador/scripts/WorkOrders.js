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
          label: 'ID',
          field: 'id',
          type: 'string',
          sortable: true,
          width: '120px'
        },
        {
          label: 'Cliente',
          field: 'client_name',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por cliente'
          }
        },
        {
          label: 'Descripción',
          field: 'description',
          type: 'string',
          sortable: true,
          width: '250px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por descripción'
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
              { value: 'pending', text: 'Pendiente' },
              { value: 'in_progress', text: 'En Progreso' },
              { value: 'completed', text: 'Completada' },
              { value: 'delayed', text: 'Retrasada' },
              { value: 'cancelled', text: 'Cancelada' }
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
              { value: 'low', text: 'Baja' },
              { value: 'medium', text: 'Media' },
              { value: 'high', text: 'Alta' },
              { value: 'urgent', text: 'Urgente' }
            ],
            filterMultiselect: false,
            placeholder: 'Todas las prioridades'
          }
        },
        {
          label: 'Asignado a',
          field: 'assigned_to_name',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por asignado'
          }
        },
        {
          label: 'F. Inicio',
          field: 'start_date',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'F. Fin',
          field: 'end_date',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
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
        
        // Filtro por cliente
        const matchesClient = this.clientFilter === 'all' || 
          order.client_name.toLowerCase().includes(this.clientFilter.toLowerCase());
          
        // Filtro por asignado
        const matchesAssigned = this.assignedToFilter === 'all' || 
          order.assigned_to_name.toLowerCase().includes(this.assignedToFilter.toLowerCase());
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
          order.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.client_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.assigned_to_name.toLowerCase().includes(this.searchQuery.toLowerCase());
          
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
      return this.orders.filter(order => order.status === 'pending').length;
    },
    
    inProgressOrders() {
      return this.orders.filter(order => order.status === 'in_progress').length;
    },
    
    completedOrders() {
      return this.orders.filter(order => order.status === 'completed').length;
    },
    
    delayedOrders() {
      return this.orders.filter(order => order.status === 'delayed').length;
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
        
        // Simulamos datos realistas de órdenes de trabajo
        // En producción, esto vendría de una API
        this.orders = this.generateMockOrders();
        
        // Si tienes una API real, descomenta esto:
        // const response = await axios.get('/api/work-orders');
        // this.orders = response.data;
        
      } catch (error) {
        console.error('Error cargando órdenes de trabajo:', error);
        this.showToast('Error al cargar órdenes de trabajo', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    // Genera datos mock para demostración
    generateMockOrders() {
      const statuses = ['pending', 'in_progress', 'completed', 'delayed', 'cancelled'];
      const priorities = ['low', 'medium', 'high', 'urgent'];
      const clients = ['Empresa ABC SA', 'Industrias XYZ', 'Manufacturas DEF', 'Compañía GHI', 'Corporación JKL'];
      const technicians = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Luis Rodríguez', 'Sofia Torres'];
      const workTypes = [
        'Mantenimiento preventivo de maquinaria',
        'Reparación de sistema hidráulico',
        'Instalación de equipo nuevo',
        'Calibración de instrumentos',
        'Soldadura especializada',
        'Inspección de calidad',
        'Modificación de pieza',
        'Actualización de software',
        'Limpieza y lubricación',
        'Reemplazo de componentes'
      ];
      
      const orders = [];
      
      for (let i = 1; i <= 40; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 21) + 1);
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        // Calcular progreso basado en el estado
        let progress = 0;
        switch (status) {
          case 'pending':
            progress = 0;
            break;
          case 'in_progress':
            progress = Math.floor(Math.random() * 80) + 10;
            break;
          case 'completed':
            progress = 100;
            break;
          case 'delayed':
            progress = Math.floor(Math.random() * 70) + 10;
            break;
          case 'cancelled':
            progress = Math.floor(Math.random() * 50);
            break;
        }
        
        orders.push({
          id: `OT-${new Date().getFullYear()}-${String(i).padStart(3, '0')}`,
          client_name: clients[Math.floor(Math.random() * clients.length)],
          description: workTypes[Math.floor(Math.random() * workTypes.length)],
          status: status,
          priority: priority,
          assigned_to_name: technicians[Math.floor(Math.random() * technicians.length)],
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          progress: progress,
          estimated_hours: Math.floor(Math.random() * 40) + 8,
          materials_cost: Math.floor(Math.random() * 5000) + 500,
          labor_cost: Math.floor(Math.random() * 3000) + 800,
          notes: this.generateOrderNotes(status),
          createdAt: startDate.toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return orders;
    },
    
    generateOrderNotes(status) {
      const notes = {
        pending: ['Orden recibida, esperando asignación', 'Materiales en proceso de compra', 'Pendiente de aprobación del cliente'],
        in_progress: ['Trabajo en desarrollo según cronograma', 'Se requiere material adicional', 'Avanza según lo planificado'],
        completed: ['Trabajo completado exitosamente', 'Cliente satisfecho con el resultado', 'Entregado dentro del plazo'],
        delayed: ['Retraso por falta de materiales', 'Complicaciones técnicas imprevistas', 'Esperando repuestos'],
        cancelled: ['Cancelado por el cliente', 'Cambio en los requerimientos', 'Problemas de presupuesto']
      };
      return notes[status][Math.floor(Math.random() * notes[status].length)];
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
    
    completeOrder(order) {
      if (confirm('¿Está seguro de marcar esta orden como completada?')) {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index].status = 'completed';
          this.orders[index].progress = 100;
          this.showToast('Orden marcada como completada', 'success');
        }
      }
    },
    
    deleteOrder(orderId) {
      if (confirm('¿Está seguro de que desea eliminar esta orden de trabajo?')) {
        try {
          this.loadingDelete = orderId;
          
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
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completada',
        'delayed': 'Retrasada',
        'cancelled': 'Cancelada'
      };
      return statuses[status] || status;
    },
    
    statusClass(status) {
      return {
        'pending': 'badge-warning',
        'in_progress': 'badge-info',
        'completed': 'badge-success',
        'delayed': 'badge-danger',
        'cancelled': 'badge-secondary'
      }[status] || 'badge-light';
    },
    
    formatPriority(priority) {
      const priorities = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      };
      return priorities[priority] || priority;
    },
    
    priorityClass(priority) {
      return {
        'low': 'badge-secondary',
        'medium': 'badge-info',
        'high': 'badge-warning',
        'urgent': 'badge-danger'
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
        console.error('Error exportando CSV:', error);
        this.showToast('Error al exportar tabla', 'error');
      }
    },
    
    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      // Aquí puedes integrar tu sistema de notificaciones
      alert(`${type.toUpperCase()}: ${message}`);
    },
    
    // =========== MÉTODOS DEL MODAL DE NUEVA ORDEN ===========
    
    // Abrir modal para nueva orden
    openNewOrderModal() {
      this.resetNewOrder();
      this.showNewOrderModal = true;
      console.log('Abriendo modal de nueva orden');
    },
    
    // Cerrar modal de nueva orden
    closeNewOrderModal() {
      this.showNewOrderModal = false;
      this.resetNewOrder();
      console.log('Cerrando modal de nueva orden');
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
        console.log('Guardando nueva orden:', orderData);
        
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
        console.error('Error al crear nueva orden:', error);
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
      console.log('Abriendo Wizard Modal de nueva orden');
    },
    
    // Cerrar el wizard modal
    onWizardClose() {
      this.showWizardModal = false;
      console.log('Cerrando Wizard Modal');
    },
    
    // Manejar el guardado desde el wizard
    async onOrderSave(orderData) {
      try {
        console.log('Guardando orden desde wizard:', orderData);
        
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
        console.error('Error al crear orden desde wizard:', error);
        this.showToast('Error al crear la orden de trabajo', 'error');
      }
    },
    
    // Manejar el guardado de borrador
    onDraftSaved(draftData) {
      console.log('Borrador guardado:', draftData);
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
