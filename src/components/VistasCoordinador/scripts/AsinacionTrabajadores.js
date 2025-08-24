export default {
  name: 'AsignarPedidosModal',
  props: {
    show: Boolean,
    pedidos: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    showError: Function,     
    showSuccess: Function 
  },
  emits: ['close', 'confirm'],
  data() {
    return {
      pedidosSeleccionados: [],
      usuariosAsignados: [], 
      horasAsignadas:8,
      fechaLimite: '',
      instrucciones: '',
      procesando: false
    }
  },
  computed: {
    formularioValido() {
      return this.pedidosSeleccionados.length > 0 && 
             this.usuariosAsignados.length > 0 && 
             this.fechaLimite;
    },
    fechaMinima() {
      const hoy = new Date();
      return hoy.toISOString().split('T')[0];
    }
  },
  mounted() {
    // Establecer fecha mínima por defecto (mañana)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    this.fechaLimite = mañana.toISOString().split('T')[0];
    
    // Focus en el primer elemento usando ref
    this.$nextTick(() => {
      if (this.$refs.modalContainer) {
        const firstCheckbox = this.$refs.modalContainer.querySelector('input[type="checkbox"]');
        if (firstCheckbox) {
          firstCheckbox.focus();
        }
      }
    });
  },
  methods: {
    // Métodos para pedidos
    seleccionarTodosPedidos() {
      this.pedidosSeleccionados = this.pedidos.map(p => p.id);
    },
    
    limpiarSeleccionPedidos() {
      this.pedidosSeleccionados = [];
    },
    
    // Métodos para trabajadores
    seleccionarTodosTrabajadores() {
      this.usuariosAsignados = this.usuarios.map(u => u.id);
    },
    
    limpiarSeleccionTrabajadores() {
      this.usuariosAsignados = [];
    },
    async confirmarAsignacion() {
  if (!this.formularioValido) return;
  
  this.procesando = true;
  
  try {
    const asignaciones = this.usuariosAsignados.flatMap(usuarioId =>
      this.pedidosSeleccionados.map(pedidoId => ({
        usuarioId: Number(usuarioId),
        pedidoId: Number(pedidoId),
        horasAsignadas: Number(this.horasAsignadas),
      }))
    );

    console.log('Enviando asignaciones:', asignaciones);

    const promises = asignaciones.map(async (asignacion) => {
      const response = await fetch('/api/Asignaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignacion)
      });

      // MEJOR MANEJO DE ERRORES
      if (!response.ok) {
        let errorMessage = `Error ${response.status} al asignar pedido ${asignacion.pedidoId}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Detalles del error:', errorData);
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    });

    const resultados = await Promise.all(promises);
    
    this.showSuccess(`✅ ${resultados.length} asignación(es) completada(s)`);
    this.$emit('close');
    this.$emit('asignacion-completada', resultados);
    
  } catch (error) {
    console.error('Error completo en asignaciones:', error);
    this.showError(error.message || 'Error al completar las asignaciones');
  } finally {
    this.procesando = false;
  }
}
    
    /*async confirmarAsignacion() {
      if (!this.formularioValido) return;
      
      this.procesando = true;
      
      try {
        const asignacionData = {
          pedidos: this.pedidosSeleccionados,
          usuarios: this.usuariosAsignados, // Cambiado para enviar array de usuarios
          fecha_limite: this.fechaLimite,
          instrucciones: this.instrucciones.trim()
        };
        
        this.$emit('confirm', asignacionData);
        
        // Limpiar formulario
        this.limpiarFormulario();
        
      } catch (error) {
        console.error('Error en asignación:', error);
      } finally {
        this.procesando = false;
      }
    }*/,
    
    limpiarFormulario() {
      this.pedidosSeleccionados = [];
      this.usuariosAsignados = [];
      this.instrucciones = '';
      // Mantener fecha límite
    },
    
    // Métodos de utilidad
    getStatusClass(estadoId) {
      const statusClasses = {
        1: 'status-draft',
        2: 'status-pending',
        3: 'status-approved', 
        4: 'status-in-progress',
        5: 'status-completed',
        6: 'status-cancelled'
      };
      return statusClasses[estadoId] || 'status-unknown';
    },
    
    getStatusName(estadoId) {
      const statusNames = {
        1: 'Borrador',
        2: 'Pendiente Aprobación',
        3: 'Aprobado',
        4: 'En Proceso',
        5: 'Completado',
        6: 'Cancelado'
      };
      return statusNames[estadoId] || 'Desconocido';
    },
    
    getPriorityName(prioridad) {
      const priorities = {
        1: 'Alta',
        2: 'Media-Alta',
        3: 'Media',
        4: 'Media-Baja',
        5: 'Baja'
      };
      return priorities[prioridad] || 'Sin prioridad';
    },
    
    formatDate(date) {
      if (!date) return 'Sin fecha';
      return new Date(date).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },
  watch: {
    show(newVal) {
      if (!newVal) {
        this.limpiarFormulario();
      }
    }
  }
}