import api from '@/api.js'

export default {
  data() {
    return {
      // Opciones para herramientas
      todasHerramientasOptions: [],
      herramientasSugeridas: [],
    }
  },

  methods: {
    // === Métodos del Paso 4: Herramientas ===
    validateStep4() {
      // El paso 4 no tiene validaciones obligatorias
      return true
    },

    addHerramientaAdicional() {
      this.formData.herramientas_adicionales.push({
        herramienta_id: null,
        cantidad_solicitada: 1,
        fecha_devolucion: null
      })
    },

    removeHerramientaAdicional(index) {
      this.formData.herramientas_adicionales.splice(index, 1)
    },

    getEstadoColor(estado) {
      const colors = {
        'disponible': 'success',
        'reservada': 'warning',
        'mantenimiento': 'danger',
        'en_uso': 'info'
      }
      return colors[estado] || 'medium'
    },

    // === Métodos de carga de herramientas desde API ===
    async loadHerramientasFromAPI() {
      try {
        const response = await api.get('/Herramienta')
        this.todasHerramientasOptions = response.map(herramienta => ({
          id: herramienta.id,
          nombre: herramienta.nombre,
          modelo: herramienta.modelo,
          fabricante: herramienta.fabricante,
          numero_serie: herramienta.numero_serie,
          codigo_inventario: herramienta.codigo_inventario,
          estado: this.mapEstadoHerramienta(herramienta.estado_herramienta_id),
          estado_id: herramienta.estado_herramienta_id,
          vida_util_horas: parseFloat(herramienta.vida_util_horas) || 0,
          horas_uso_actual: parseFloat(herramienta.horas_uso_actual) || 0,
          zona_trabajo_id: herramienta.zonas_trabajo_id,
          fecha_adquisicion: herramienta.fecha_adquisicion,
          costo_adquisicion: parseFloat(herramienta.costo_adquisicion) || 0,
          valor_actual: parseFloat(herramienta.valor_actual) || 0,
          especificaciones_tecnicas: herramienta.especificaciones_tecnicas,
          imagen_ruta: herramienta.imagen_ruta,
          fecha_ultimo_mantenimiento: herramienta.fecha_ultimo_mantenimiento,
          fecha_proximo_mantenimiento: herramienta.fecha_proximo_mantenimiento,
          notas: herramienta.notas,
          // Campos calculados útiles
          porcentaje_uso: herramienta.vida_util_horas > 0
            ? Math.round((herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100)
            : 0,
          disponible_para_uso: this.isHerramientaDisponible(herramienta.estado_herramienta_id),
          requiere_mantenimiento: this.requiresMantenimiento(herramienta.fecha_proximo_mantenimiento)
        }))
      } catch (error) {
        console.error('Error al cargar herramientas:', error)
        this.showValidationError('Error al cargar las herramientas disponibles')
        // Mantener array vacío como fallback
        this.todasHerramientasOptions = []
      }
    },

    mapEstadoHerramienta(estadoId) {
      // Mapear estado_herramienta_id a texto legible
      const estados = {
        1: 'disponible',
        2: 'en_uso',
        3: 'mantenimiento',
        4: 'reservada',
        5: 'fuera_servicio'
      }
      return estados[estadoId] || 'desconocido'
    },

    isHerramientaDisponible(estadoId) {
      // Solo disponible si el estado es 'disponible' (id: 1)
      return estadoId === 1
    },

    requiresMantenimiento(fechaProximoMantenimiento) {
      if (!fechaProximoMantenimiento) return false

      const hoy = new Date()
      const fechaMantenimiento = new Date(fechaProximoMantenimiento)
      const diasHastaMantenimiento = Math.ceil((fechaMantenimiento - hoy) / (1000 * 60 * 60 * 24))

      // Requiere mantenimiento si faltan menos de 30 días o ya pasó la fecha
      return diasHastaMantenimiento <= 30
    }
  }
}
