export default {
  computed: {
    canCreateImmediately() {
      // Simular permisos del usuario para crear inmediatamente
      return true // En producción esto vendría del store/auth
    }
  },

  methods: {
    // === Métodos del Paso 7: Revisión ===
    validateStep7() {
      // El paso 7 no tiene validaciones obligatorias
      return true
    },

    prepareReview() {
      this.calculateCosts()
      // Cualquier preparación adicional para la revisión final
    },

    formatDate(date) {
      if (!date) return 'N/A'

      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()

      return `${day}/${month}/${year}`
    },

    // === Métodos Finales ===
    async sendForApproval() {
      try {
        const orderData = this.prepareOrderData('Pendiente Aprobación')
        
        // Consumir API para guardar el pedido
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}` // Si es necesario
          },
          body: JSON.stringify({
            ...orderData,
            action: 'send_for_approval'
          })
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          action: 'send_for_approval'
        })

        this.clearDraftFromStorage()
        this.close()

        this.showSuccess('Pedido enviado para aprobación exitosamente')

      } catch (error) {
        console.error('Error al enviar para aprobación:', error)
        this.showError(`Error al enviar el pedido: ${error.message}`)
      }
    },

    async createImmediately() {
      try {
        const orderData = this.prepareOrderData('Aprobado')
        
        // Consumir API para guardar el pedido
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}` // Si es necesario
          },
          body: JSON.stringify({
            ...orderData,
            action: 'create_immediately'
          })
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id, // ID generado por el backend
          action: 'create_immediately'
        })

        this.clearDraftFromStorage()
        this.close()

        this.showSuccess('Pedido creado exitosamente')

      } catch (error) {
        console.error('Error al crear pedido:', error)
        this.showError(`Error al crear el pedido: ${error.message}`)
      }
    },

    // Método para guardar como borrador
    async saveDraft() {
      try {
        const orderData = this.prepareOrderData('Borrador')
        
        const response = await fetch('/api/Pedido/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        })

        if (response.ok) {
          const result = await response.json()
          this.showSuccess('Borrador guardado exitosamente')
          return result.id
        }
      } catch (error) {
        console.error('Error al guardar borrador:', error)
        this.showError('Error al guardar borrador')
      }
    },

    prepareOrderData(estado) {
      // Formatear fechas correctamente para DATEONLY (YYYY-MM-DD)
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      };

      // Formatear fechas para DATETIME (YYYY-MM-DD HH:MM:SS)
      const formatDateTimeForAPI = (date) => {
        if (!date) return null;
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
      };

      // Validar campos obligatorios antes de enviar
      const requiredFields = {
        tipo_pedido_id: this.formData.tipo_pedido_id,
        plano_id: this.formData.plano_id,
        solicitante_id: this.formData.solicitante_id,
        fecha_requerida: this.formData.fecha_requerida,
        precio_final: this.formData.precio_final
      };

      // Verificar que los campos obligatorios no estén vacíos
      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value === '' || value === null || value === undefined) {
          throw new Error(`El campo ${field} es obligatorio`);
        }
      }

      // Asegurar que los datos estén en el formato esperado por la API/BD
      const orderData = {
        // Campo único obligatorio
        codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
        
        // Campos obligatorios - convertir a enteros
        tipo_pedido_id: parseInt(this.formData.tipo_pedido_id),
        plano_id: parseInt(this.formData.plano_id),
        solicitante_id: parseInt(this.formData.solicitante_id),
        estado_id: this.getEstadoId(estado),
        
        // Campos opcionales - solo incluir si tienen valor
        ...(this.formData.aprobador_id && { 
          aprobador_id: parseInt(this.formData.aprobador_id) 
        }),
        ...(this.formData.supervisor_id && { 
          supervisor_id: parseInt(this.formData.supervisor_id) 
        }),
        
        // Fechas obligatorias
        fecha_solicitud: formatDateTimeForAPI(new Date()),
        fecha_requerida: formatDateForAPI(this.formData.fecha_requerida),
        
        // Fechas opcionales - solo incluir si tienen valor
        ...(estado === 'Aprobado' && { 
          fecha_aprobacion: formatDateTimeForAPI(new Date()) 
        }),
        ...(this.formData.fecha_estimada_entrega && { 
          fecha_estimada_entrega: formatDateForAPI(this.formData.fecha_estimada_entrega) 
        }),
        
        // Campos con valores por defecto del modelo
        contador_pausas: 0,
        tiempo_total_pausado: 0,
        prioridad: parseInt(this.formData.prioridad) || 3,
        
        // Campos opcionales de texto/decimales
        ...(this.formData.proyecto_asociado && { 
          proyecto_asociado: this.formData.proyecto_asociado 
        }),
        ...(this.costoTotalEstimado && { 
          costo_estimado: parseFloat(this.costoTotalEstimado) 
        }),
        
        // Precio final es obligatorio
        precio_final: parseFloat(this.formData.precio_final),
        
        // Notas opcionales
        ...(this.formData.notas && { 
          notas: this.formData.notas 
        }),
        
        // Timestamps - Sequelize los maneja automáticamente, pero los incluimos por compatibilidad
        createdAt: formatDateTimeForAPI(new Date()),
        updatedAt: formatDateTimeForAPI(new Date())
      };

      // Validación adicional: precio_final debe ser mayor que costo_estimado
      if (orderData.costo_estimado && orderData.precio_final <= orderData.costo_estimado) {
        throw new Error('El precio final debe ser mayor que el costo estimado');
      }

      // Validar que los IDs sean números válidos
      const numericFields = ['tipo_pedido_id', 'plano_id', 'solicitante_id', 'estado_id'];
      for (const field of numericFields) {
        if (orderData[field] && (isNaN(orderData[field]) || orderData[field] <= 0)) {
          throw new Error(`El campo ${field} debe ser un número válido mayor a 0`);
        }
      }

      // Validar que las fechas sean válidas
      if (orderData.fecha_requerida) {
        const fechaRequerida = new Date(orderData.fecha_requerida);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Reset hours to compare only dates
        
        if (fechaRequerida < hoy) {
          throw new Error('La fecha requerida no puede ser anterior a hoy');
        }
      }

      console.log('Datos preparados para envío:', orderData);
      return orderData;
    },

    // Métodos actualizados para manejar errores de validación
    async sendForApproval() {
      try {
        const orderData = this.prepareOrderData('Pendiente Aprobación')
        
        // Consumir API para guardar el pedido
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'send_for_approval'
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'send_for_approval'
        })

        this.clearDraftFromStorage()
        this.close()

        this.showSuccess('Pedido enviado para aprobación exitosamente')

      } catch (error) {
        console.error('Error al enviar para aprobación:', error)
        this.showError(`Error al enviar el pedido: ${error.message}`)
      }
    },

    async createImmediately() {
      try {
        const orderData = this.prepareOrderData('Aprobado')
        
        // Consumir API para guardar el pedido
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'create_immediately'
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'create_immediately'
        })

        this.clearDraftFromStorage()
        this.close()

        this.showSuccess('Pedido creado exitosamente')

      } catch (error) {
        console.error('Error al crear pedido:', error)
        this.showError(`Error al crear el pedido: ${error.message}`)
      }
    },

    async saveDraft() {
      try {
        // Para borradores, no validamos campos obligatorios tan estrictamente
        const orderData = {
          codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
          tipo_pedido_id: this.formData.tipo_pedido_id ? parseInt(this.formData.tipo_pedido_id) : null,
          plano_id: this.formData.plano_id ? parseInt(this.formData.plano_id) : null,
          solicitante_id: this.formData.solicitante_id ? parseInt(this.formData.solicitante_id) : null,
          aprobador_id: this.formData.aprobador_id ? parseInt(this.formData.aprobador_id) : null,
          supervisor_id: this.formData.supervisor_id ? parseInt(this.formData.supervisor_id) : null,
          fecha_requerida: this.formData.fecha_requerida || null,
          fecha_estimada_entrega: this.formData.fecha_estimada_entrega || null,
          estado_id: this.getEstadoId('Borrador'),
          prioridad: parseInt(this.formData.prioridad) || 3,
          proyecto_asociado: this.formData.proyecto_asociado || '',
          costo_estimado: this.costoTotalEstimado ? parseFloat(this.costoTotalEstimado) : null,
          precio_final: this.formData.precio_final ? parseFloat(this.formData.precio_final) : null,
          notas: this.formData.notas || ''
        };
        
        const response = await fetch('/api/Pedido/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(orderData)
        })

        if (response.ok) {
          const result = await response.json()
          this.showSuccess('Borrador guardado exitosamente')
          return result.id
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error al guardar borrador:', error)
        this.showError(`Error al guardar borrador: ${error.message}`)
      }
    },
  }
}