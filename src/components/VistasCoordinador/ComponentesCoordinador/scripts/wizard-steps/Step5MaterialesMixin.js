import api from '@/api.js'

export default {
  data() {
    return {
      // Opciones para materiales
      todosMaterialesOptions: [],
      materialesSugeridos: [],
      unidadesMedidaOptions: [],
      alertasStock: [],
      tiposStockOptions: [
        { text: 'Interno', value: 'interno' },
        { text: 'Externo', value: 'externo' },
        { text: 'Prácticas', value: 'practicas' }
      ],
    }
  },

  methods: {
    // === Métodos del Paso 5: Materiales ===
    validateStep5() {
      // El paso 5 no tiene validaciones obligatorias
      return true
    },

    loadMaterialesSugeridos() {
      // Si no hay plano seleccionado o no hay materiales cargados, no hacer nada
      if (!this.selectedPlano || this.todosMaterialesOptions.length === 0) {
        return;
      }

      // Usar los dos primeros materiales de la lista como sugeridos (simulación)
      // En un sistema real, estos vendrían de la relación plano-materiales
      const materialesSugeridos = this.todosMaterialesOptions.slice(0, 2).map((material, index) => {
        const cantidad = index === 0 ? 50 : 20;
        return {
          id: material.id,
          nombre: material.nombre,
          cantidad_sugerida: cantidad,
          cantidad_solicitada: cantidad,
          stock_actual: parseFloat(material.stock_total) || 0,
          stock_suficiente: (parseFloat(material.stock_total) || 0) >= cantidad,
          unidad_medida: this.getUnidadMedida(material.unidad_base_id),
          unidad_medida_id: material.unidad_base_id,
          tipo_stock_destino: 'interno',
          desperdicio_estimado: index === 0 ? 5 : 3,
          costo_unitario: parseFloat(material.costo_unitario) || 0
        };
      });

      this.materialesSugeridos = materialesSugeridos;
      this.checkStockAlerts();
    },

    addMaterialAdicional() {
      this.formData.materiales_adicionales.push({
        material_id: null,
        cantidad_solicitada: 0,
        unidad_medida_id: null
      })
    },

    removeMaterialAdicional(index) {
      this.formData.materiales_adicionales.splice(index, 1)
    },

    calculateMaterialCost(material) {
      const cantidad = parseFloat(material.cantidad_solicitada) || 0
      const desperdicio = (parseFloat(material.desperdicio_estimado) || 0) / 100
      const cantidadTotal = cantidad * (1 + desperdicio)
      const costo = cantidadTotal * material.costo_unitario

      return costo.toFixed(2)
    },

    checkStockAlerts() {
      this.alertasStock = []

      this.materialesSugeridos.forEach(material => {
        if (!material.stock_suficiente) {
          this.alertasStock.push({
            id: material.id,
            mensaje: `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock_actual}, Requerido: ${material.cantidad_solicitada}`
          })
        }

        if (material.stock_actual <= material.stock_minimo) {
          this.alertasStock.push({
            id: `${material.id}_minimo`,
            mensaje: `${material.nombre} está cerca del stock mínimo (${material.stock_minimo})`
          })
        }
      })
    },

    getUnidadMedida(unidadId) {
      const unidad = this.unidadesMedidaOptions.find(u => u.id === parseInt(unidadId))
      return unidad ? unidad.nombre : 'unidad'
    },

    // === Métodos para cargar materias primas desde API ===
    async loadMateriasPrimasFromAPI() {
      try {
        const response = await api.get('/MateriaPrima')
        this.todosMaterialesOptions = response.map(materiaPrima => ({
          id: materiaPrima.id,
          codigo: materiaPrima.codigo,
          nombre: materiaPrima.nombre,
          descripcion: materiaPrima.descripcion,
          tipo_materia_prima_id: materiaPrima.tipo_materia_prima_id,
          unidad_base_id: materiaPrima.unidad_base_id,
          stock_minimo: parseFloat(materiaPrima.stock_minimo) || 0,
          stock_maximo: parseFloat(materiaPrima.stock_maximo) || 0,
          unidades_completas: parseFloat(materiaPrima.unidades_completas) || 0,
          fracciones: parseFloat(materiaPrima.fracciones) || 0,
          stock_total: parseFloat(materiaPrima.stock_total) || 0,
          fraccion_unidad_id: materiaPrima.fraccion_unidad_id,
          permite_fraccion: materiaPrima.permite_fraccion,
          pertenece_a_stock_id: materiaPrima.pertenece_a_stock_id,
          costo_unitario: parseFloat(materiaPrima.costo_unitario) || 0,
          proveedor_principal: materiaPrima.proveedor_principal,
          tiempo_reposicion: parseInt(materiaPrima.tiempo_reposicion) || 0,
          es_controlado: materiaPrima.es_controlado,
          // Campos calculados
          stock_suficiente: parseFloat(materiaPrima.stock_total) > parseFloat(materiaPrima.stock_minimo),
          necesita_reposicion: parseFloat(materiaPrima.stock_total) <= parseFloat(materiaPrima.stock_minimo)
        }))

        // Si ya estamos en el paso de materiales, recargar los materiales sugeridos
        if (this.currentStep === 5) {
          this.loadMaterialesSugeridos()
        }
      } catch (error) {
        console.error('Error al cargar materias primas:', error)
        this.showValidationError('Error al cargar las materias primas disponibles')
        // Mantener array vacío como fallback
        this.todosMaterialesOptions = []
      }
    },

    // === Métodos para cargar unidades de medida desde API ===
    async loadUnidadesMedidaFromAPI() {
      try {
        const response = await api.get('/Unidad_Medida')
        this.unidadesMedidaOptions = response.map(unidad => ({
          id: unidad.id,
          nombre: unidad.nombre,
          abreviatura: unidad.abreviatura,
          tipo: unidad.tipo,
          // Campos adicionales útiles
          nombre_completo: `${unidad.nombre} (${unidad.abreviatura})`,
          es_longitud: unidad.tipo === 'longitud',
          es_peso: unidad.tipo === 'peso',
          es_volumen: unidad.tipo === 'volumen',
          es_cantidad: unidad.tipo === 'cantidad'
        }))

        // Ordenar por tipo y luego por nombre
        this.unidadesMedidaOptions.sort((a, b) => {
          if (a.tipo === b.tipo) {
            return a.nombre.localeCompare(b.nombre)
          }
          return a.tipo.localeCompare(b.tipo)
        })

        // Si ya estamos en el paso de materiales, recargar los materiales sugeridos
        if (this.currentStep === 5) {
          this.loadMaterialesSugeridos()
        }
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error)
        this.showValidationError('Error al cargar las unidades de medida disponibles')
        // Fallback con unidades básicas
        this.unidadesMedidaOptions = [
          { id: 1, nombre: 'Metro', abreviatura: 'm', tipo: 'longitud' },
          { id: 2, nombre: 'Kilogramo', abreviatura: 'kg', tipo: 'peso' },
          { id: 3, nombre: 'Litro', abreviatura: 'L', tipo: 'volumen' },
          { id: 4, nombre: 'Unidad', abreviatura: 'u', tipo: 'cantidad' }
        ]
      }
    }
  }
}
