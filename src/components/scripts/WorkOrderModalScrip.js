export default {
  props: {
    pedido: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        codigo_pedido: '',
        tipo_pedido_id: null,
        prioridad: 3,
        fecha_inicio: '',
        fecha_fin: '',
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        horas_estimadas: null,
        proyecto_asociado: '',
        costo_estimado: null,
        precio_final: null,
        trabajadores_asignados: [],
        herramientas_asignadas: [],
        materiales: [],
        planos: [],
        notas: '',
        estado_id: 1
      })
    },
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'edit'].includes(value)
    }
  },
  
  data() {
    return {
      // Separación de usuarios por tipo
      tecnicos: [],
      operarios: [],
      herramientas: [],
      proyectos: [],
      tiposPedido: [], // Ahora se carga desde la API
      materialOptions: [],
      loadingMateriales: false,
      filterStock: 'all',
      
      // Estados de carga
      loadingTiposPedido: false,
      loadingTecnicos: false,
      loadingOperarios: false,
      loadingHerramientas: false,
      loadingPlanos: false,
      saving: false,
      
      // Búsqueda y filtros
      searchTecnicos: '',
      searchOperarios: '',
      searchHerramientas: '',
      searchMateriales: '',
      workerFilter: 'available',
      
      // Archivos nuevos
      newFiles: [],
      
      // Sistema de alertas y conflictos
      alertas: [],
      sugerenciasAlternativas: [],
      conflictosDetectados: [],
      capacidadDisponible: 0,
      hayRiesgoSobrecarga: false,
      recomendacionTemporal: null,
      
      // Control de trabajadores combinados
      availableWorkers: [],
      busyWorkers: [],
      allWorkers: []
    }
  },
  
  computed: {
    // Combinación de técnicos y operarios
    combinedWorkers() {
      return [
        ...this.tecnicos.map(t => ({ ...t, tipo: 'Técnico' })),
        ...this.operarios.map(o => ({ ...o, tipo: 'Operario' }))
      ];
    },
    
    filteredUsuarios() {
      let workers = this.allWorkers;
      
      // Aplicar filtro de disponibilidad
      switch (this.workerFilter) {
        case 'available':
          workers = this.availableWorkers;
          break;
        case 'busy':
          workers = this.busyWorkers;
          break;
        case 'tecnicos':
          workers = this.allWorkers.filter(w => w.tipo === 'Técnico');
          break;
        case 'operarios':
          workers = this.allWorkers.filter(w => w.tipo === 'Operario');
          break;
        case 'all':
        default:
          workers = this.allWorkers;
          break;
      }
      
      // Aplicar filtro de búsqueda
      const searchTerm = this.workerFilter === 'tecnicos' ? this.searchTecnicos : 
                        this.workerFilter === 'operarios' ? this.searchOperarios : 
                        this.searchTecnicos || this.searchOperarios;
      
      if (!searchTerm) return workers;
      
      const search = searchTerm.toLowerCase();
      return workers.filter(usuario => {
        const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase();
        const puestoNombre = usuario.puesto?.nombre?.toLowerCase() || '';
        const email = usuario.email?.toLowerCase() || '';
        const habilidades = usuario.habilidades?.join(' ').toLowerCase() || '';
        const tipo = usuario.tipo?.toLowerCase() || '';
        
        return nombreCompleto.includes(search) || 
               puestoNombre.includes(search) ||
               email.includes(search) ||
               habilidades.includes(search) ||
               tipo.includes(search);
      });
    },
    
    filteredHerramientas() {
      if (!this.searchHerramientas) return this.herramientas;
      const search = this.searchHerramientas.toLowerCase();
      return this.herramientas.filter(herramienta =>
        herramienta.nombre.toLowerCase().includes(search) ||
        (herramienta.tipo && herramienta.tipo.toLowerCase().includes(search)) ||
        (herramienta.descripcion && herramienta.descripcion.toLowerCase().includes(search))
      );
    },

    filteredAvailableMaterials() {
      let materials = this.materialOptions;
      
      // Aplicar filtro de búsqueda
      if (this.searchMateriales) {
        const search = this.searchMateriales.toLowerCase();
        materials = materials.filter(material => 
          material.nombre.toLowerCase().includes(search) ||
          (material.descripcion && material.descripcion.toLowerCase().includes(search))
        );
      }
      
      // Aplicar filtro de stock
      switch (this.filterStock) {
        case 'available':
          materials = materials.filter(m => m.stock > 0);
          break;
        case 'low':
          materials = materials.filter(m => m.stock > 0 && m.stock <= (m.stock_minimo || 5));
          break;
        // 'all' no necesita filtro adicional
      }
      
      return materials.sort((a, b) => {
        // Ordenar primero los seleccionados
        const aSelected = this.isMaterialSelected(a.id);
        const bSelected = this.isMaterialSelected(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        
        // Luego por stock (disponibles primero)
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        
        // Luego por stock bajo
        const aLowStock = a.stock <= (a.stock_minimo || 5);
        const bLowStock = b.stock <= (b.stock_minimo || 5);
        if (aLowStock && !bLowStock) return -1;
        if (!aLowStock && bLowStock) return 1;
        
        // Finalmente por nombre
        return a.nombre.localeCompare(b.nombre);
      });
    },

    // Computed para estadísticas
    workersStats() {
      return {
        totalTecnicos: this.tecnicos.length,
        totalOperarios: this.operarios.length,
        tecnicosDisponibles: this.tecnicos.filter(t => t.disponible).length,
        operariosDisponibles: this.operarios.filter(o => o.disponible).length
      };
    }
  },
  
  watch: {
    'pedido.fecha_inicio': 'checkConflicts',
    'pedido.fecha_fin': 'checkConflicts',
    'pedido.horas_estimadas': 'calculateWorkload',
    'pedido.trabajadores_asignados': {
      handler: 'calculateWorkload',
      deep: true
    },
    
    // Watch para combinar workers cuando cambien
    tecnicos: {
      handler: 'updateCombinedWorkers',
      deep: true
    },
    operarios: {
      handler: 'updateCombinedWorkers',
      deep: true
    }
  },
  
  async mounted() {
    await this.loadProyectos();
    await this.loadTiposPedido();
    await this.loadTecnicos();
    await this.loadOperarios();
    await this.loadHerramientas();
    await this.loadMateriales();
    this.initializeWorkloadCalculation();
  },
  
  methods: {
    // ==================== MÉTODOS DE CARGA DE DATOS MODIFICADOS ====================
    
    // Cargar tipos de pedido desde la API
    async loadTiposPedido() {
      this.loadingTiposPedido = true;
      try {
        const response = await fetch('/api/Tipo_Pedido');
        if (response.ok) {
          this.tiposPedido = await response.json();
        } else {
          console.error('Error al cargar tipos de pedido:', response.statusText);
          // Fallback en caso de error
          this.tiposPedido = [
            { id: 1, nombre: 'Fabricación' },
            { id: 2, nombre: 'Reparación' },
            { id: 3, nombre: 'Mantenimiento' },
            { id: 4, nombre: 'Modificación' }
          ];
        }
      } catch (error) {
        console.error('Error al cargar tipos de pedido:', error);
        this.tiposPedido = [
          { id: 1, nombre: 'Fabricación' },
          { id: 2, nombre: 'Reparación' },
          { id: 3, nombre: 'Mantenimiento' },
          { id: 4, nombre: 'Modificación' }
        ];
      } finally {
        this.loadingTiposPedido = false;
      }
    },

    // Cargar técnicos (Puesto 4)
    async loadTecnicos() {
      this.loadingTecnicos = true;
      try {
        const response = await fetch('/api/Usuario/Puesto/4');
        if (response.ok) {
          const tecnicos = await response.json();
          this.tecnicos = tecnicos.map(tecnico => ({
            ...tecnico,
            disponible: true,
            conflictos: [],
            habilidades: tecnico.habilidades || [],
            tipo: 'Técnico',
            disponibilidad: {
              horas_disponibles: 40 // Default 40 horas por semana
            }
          }));
        } else {
          console.error('Error al cargar técnicos:', response.statusText);
          this.tecnicos = this.getFallbackTecnicos();
        }
      } catch (error) {
        console.error('Error al cargar técnicos:', error);
        this.tecnicos = this.getFallbackTecnicos();
      } finally {
        this.loadingTecnicos = false;
      }
    },

    // Cargar operarios (Puesto 3)
    async loadOperarios() {
      this.loadingOperarios = true;
      try {
        const response = await fetch('/api/Usuario/Puesto/3');
        if (response.ok) {
          const operarios = await response.json();
          this.operarios = operarios.map(operario => ({
            ...operario,
            disponible: true,
            conflictos: [],
            habilidades: operario.habilidades || [],
            tipo: 'Operario',
            disponibilidad: {
              horas_disponibles: 40 // Default 40 horas por semana
            }
          }));
        } else {
          console.error('Error al cargar operarios:', response.statusText);
          this.operarios = this.getFallbackOperarios();
        }
      } catch (error) {
        console.error('Error al cargar operarios:', error);
        this.operarios = this.getFallbackOperarios();
      } finally {
        this.loadingOperarios = false;
      }
    },

    // Cargar herramientas desde la API específica
    async loadHerramientas() {
      this.loadingHerramientas = true;
      try {
        const response = await fetch('/api/Herramientas');
        if (response.ok) {
          const herramientas = await response.json();
          this.herramientas = herramientas.map(herramienta => ({
            id: herramienta.id,
            nombre: herramienta.nombre || herramienta.descripcion,
            tipo: herramienta.tipo || 'Herramienta',
            descripcion: herramienta.descripcion,
            estado: herramienta.estado || 'Operativo',
            disponible: herramienta.disponible !== false,
            ubicacion: herramienta.ubicacion,
            codigo: herramienta.codigo
          }));
        } else {
          console.error('Error al cargar herramientas:', response.statusText);
          this.herramientas = this.getFallbackHerramientas();
        }
      } catch (error) {
        console.error('Error al cargar herramientas:', error);
        this.herramientas = this.getFallbackHerramientas();
      } finally {
        this.loadingHerramientas = false;
      }
    },

    // Cargar materiales desde la API específica
    async loadMateriales() {
      this.loadingMateriales = true;
      try {
        const response = await fetch('/api/Materia_Prima');
        if (response.ok) {
          const materiales = await response.json();
          this.materialOptions = materiales.map(material => ({
            id: material.id,
            nombre: material.nombre || material.descripcion,
            descripcion: material.descripcion || material.especificaciones,
            stock: material.cantidad_disponible || material.stock || material.existencia || 0,
            stock_minimo: material.stock_minimo || material.minimo || 5,
            unidad: material.unidad_medida || material.unidad || 'unidades',
            precio: material.precio_unitario || material.precio || 0,
            categoria: material.categoria,
            codigo: material.codigo
          }));
        } else {
          console.error('Error al cargar materiales:', response.statusText);
          this.materialOptions = this.getFallbackMateriales();
        }
      } catch (error) {
        console.error('Error al cargar materiales:', error);
        this.materialOptions = this.getFallbackMateriales();
      } finally {
        this.loadingMateriales = false;
      }
    },

    // Cargar planos existentes
    async loadPlanos() {
      if (!this.pedido.id) return;
      
      this.loadingPlanos = true;
      try {
        const response = await fetch(`/api/Plano?pedido_id=${this.pedido.id}`);
        if (response.ok) {
          const planos = await response.json();
          this.pedido.planos = planos.map(plano => ({
            id: plano.id,
            nombre_archivo: plano.nombre_archivo || plano.nombre,
            tamaño: plano.tamaño || plano.tamaño_archivo,
            fecha_subida: plano.fecha_subida || plano.fecha_creacion,
            url: plano.url || plano.ruta_archivo,
            descripcion: plano.descripcion
          }));
        }
      } catch (error) {
        console.error('Error al cargar planos:', error);
      } finally {
        this.loadingPlanos = false;
      }
    },

    // ==================== MÉTODOS DE UTILIDAD PARA TRABAJADORES ====================
    
    // Actualizar lista combinada de trabajadores
    updateCombinedWorkers() {
      this.allWorkers = [
        ...this.tecnicos.map(t => ({ ...t, tipo: 'Técnico' })),
        ...this.operarios.map(o => ({ ...o, tipo: 'Operario' }))
      ];
      this.categorizeWorkers();
    },

    // Obtener trabajador por ID (busca en ambas listas)
    getWorkerById(id) {
      return this.allWorkers.find(w => w.id === id);
    },

    // Obtener tipo de trabajador
    getWorkerType(usuarioId) {
      const worker = this.getWorkerById(usuarioId);
      return worker ? worker.tipo : 'Desconocido';
    },

    // Obtener ícono según tipo de trabajador
    getWorkerTypeIcon(tipo) {
      const icons = {
        'Técnico': 'engineering',
        'Operario': 'construction',
        'default': 'person'
      };
      return icons[tipo] || icons.default;
    },

    // ==================== MÉTODOS FALLBACK MEJORADOS ====================
    
    getFallbackTecnicos() {
      return [
        { 
          id: 1, 
          nombres: 'Juan Carlos', 
          apellidos: 'Pérez González', 
          activo: true,
          disponible: true,
          conflictos: [],
          puesto: { nombre: 'Técnico Especializado' },
          telefono: '7890-1234',
          email: 'juan.perez@empresa.com',
          habilidades: ['Soldadura MIG', 'Soldadura TIG', 'Lectura de planos', 'CNC'],
          tipo: 'Técnico',
          disponibilidad: { horas_disponibles: 40 }
        },
        { 
          id: 2, 
          nombres: 'María Elena', 
          apellidos: 'Gómez Rodríguez', 
          activo: true,
          disponible: false,
          conflictos: [
            {
              id: 1,
              proyecto_nombre: 'Mantenimiento Preventivo',
              fecha_inicio: '2024-08-15',
              fecha_fin: '2024-08-20'
            }
          ],
          puesto: { nombre: 'Técnico Industrial' },
          telefono: '7890-5678',
          email: 'maria.gomez@empresa.com',
          habilidades: ['Mecánica Industrial', 'Mantenimiento', 'Hidráulica', 'Neumática'],
          tipo: 'Técnico',
          disponibilidad: { horas_disponibles: 20 }
        }
      ];
    },

    getFallbackOperarios() {
      return [
        { 
          id: 3, 
          nombres: 'Carlos Antonio', 
          apellidos: 'López Rivera', 
          activo: true,
          disponible: true,
          conflictos: [],
          puesto: { nombre: 'Operario de Producción' },
          telefono: '7890-9012',
          email: 'carlos.lopez@empresa.com',
          habilidades: ['Manejo de herramientas básicas', 'Ensamblaje', 'Control de calidad'],
          tipo: 'Operario',
          disponibilidad: { horas_disponibles: 40 }
        },
        { 
          id: 4, 
          nombres: 'Ana Sofía', 
          apellidos: 'Martínez Cruz', 
          activo: true,
          disponible: true,
          conflictos: [],
          puesto: { nombre: 'Operario Especializado' },
          telefono: '7890-3456',
          email: 'ana.martinez@empresa.com',
          habilidades: ['Acabados', 'Pulido', 'Pintura', 'Empaque'],
          tipo: 'Operario',
          disponibilidad: { horas_disponibles: 40 }
        }
      ];
    },

    getFallbackHerramientas() {
      return [
        { 
          id: 1, 
          nombre: 'Máquina CNC Vertical', 
          tipo: 'Equipo CNC', 
          descripcion: 'Centro de mecanizado vertical 3 ejes',
          estado: 'Operativo', 
          disponible: true,
          ubicacion: 'Taller Principal',
          codigo: 'CNC-001'
        },
        { 
          id: 2, 
          nombre: 'Equipo Soldadura MIG/MAG', 
          tipo: 'Soldadura', 
          descripcion: 'Equipo de soldadura semi-automática',
          estado: 'Operativo', 
          disponible: true,
          ubicacion: 'Área de Soldadura',
          codigo: 'SOLD-002'
        },
        { 
          id: 3, 
          nombre: 'Torno Paralelo', 
          tipo: 'Torno', 
          descripción: 'Torno paralelo convencional 1500mm',
          estado: 'Mantenimiento', 
          disponible: false,
          ubicacion: 'Taller Mecánico',
          codigo: 'TOR-003'
        }
      ];
    },

    // ==================== MÉTODOS DE GUARDADO MODIFICADOS ====================
    
    // Subir archivos a la ruta /Plano
    async processNewFiles() {
      const uploadPromises = this.pedido.planos
        .filter(plano => plano.file)
        .map(async (plano) => {
          const formData = new FormData();
          formData.append('file', plano.file);
          formData.append('nombre_archivo', plano.nombre_archivo);
          formData.append('pedido_id', this.pedido.id);
          formData.append('descripcion', plano.descripcion || '');
          
          try {
            const response = await fetch('/api/Plano', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const result = await response.json();
              plano.id = result.id;
              plano.url = result.url || result.ruta_archivo;
              delete plano.file;
            } else {
              throw new Error('Error en la subida del archivo');
            }
          } catch (error) {
            console.error('Error subiendo archivo:', error);
            this.alertas.push({
              id: `upload_error_${Date.now()}`,
              tipo: 'error',
              titulo: 'Error al Subir Archivo',
              mensaje: `No se pudo subir el archivo: ${plano.nombre_archivo}`,
              detalles: error.message
            });
          }
        });
      
      await Promise.all(uploadPromises);
    },

    // ==================== MÉTODOS DE UTILIDAD ADICIONALES ====================

    // Recargar datos específicos
    async reloadData(type) {
      switch (type) {
        case 'tipos_pedido':
          await this.loadTiposPedido();
          break;
        case 'tecnicos':
          await this.loadTecnicos();
          break;
        case 'operarios':
          await this.loadOperarios();
          break;
        case 'herramientas':
          await this.loadHerramientas();
          break;
        case 'materiales':
          await this.loadMateriales();
          break;
        case 'planos':
          await this.loadPlanos();
          break;
        case 'all':
          await Promise.all([
            this.loadTiposPedido(),
            this.loadTecnicos(),
            this.loadOperarios(),
            this.loadHerramientas(),
            this.loadMateriales(),
            this.loadPlanos()
          ]);
          break;
      }
    },

    // Obtener nombre del tipo de pedido
    getTipoPedidoName(tipoId) {
      const tipo = this.tiposPedido.find(t => t.id === tipoId);
      return tipo ? tipo.nombre : 'Tipo desconocido';
    },

    // Validar disponibilidad de herramienta
    isHerramientaDisponible(herramientaId) {
      const herramienta = this.herramientas.find(h => h.id === herramientaId);
      return herramienta ? (herramienta.disponible && herramienta.estado === 'Operativo') : false;
    },

    // Obtener estadísticas de recursos
    getResourcesStats() {
      return {
        trabajadores: {
          tecnicos: this.workersStats.totalTecnicos,
          tecnicosDisponibles: this.workersStats.tecnicosDisponibles,
          operarios: this.workersStats.totalOperarios,
          operariosDisponibles: this.workersStats.operariosDisponibles
        },
        herramientas: {
          total: this.herramientas.length,
          disponibles: this.herramientas.filter(h => h.disponible && h.estado === 'Operativo').length,
          enMantenimiento: this.herramientas.filter(h => h.estado === 'Mantenimiento').length
        },
        materiales: {
          total: this.materialOptions.length,
          conStock: this.materialOptions.filter(m => m.stock > 0).length,
          stockBajo: this.materialOptions.filter(m => m.stock > 0 && m.stock <= m.stock_minimo).length,
          agotados: this.materialOptions.filter(m => m.stock <= 0).length
        }
      };
    },

    // ==================== TODOS LOS MÉTODOS EXISTENTES ANTERIORES ====================
    // (Mantener todos los métodos que estaban en el script original)
    // Solo se muestran algunos principales aquí por brevedad...

    // Sistema de alertas y conflictos
    async checkConflicts() {
      if (!this.pedido.fecha_inicio || !this.pedido.fecha_fin) return;
      
      try {
        const response = await fetch('/api/conflictos/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha_inicio: this.pedido.fecha_inicio,
            fecha_fin: this.pedido.fecha_fin,
            trabajadores: this.pedido.trabajadores_asignados,
            pedido_id: this.pedido.id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.procesarConflictos(data);
          await this.loadSugerenciasAlternativas(data.conflictos);
        }
      } catch (error) {
        console.error('Error al verificar conflictos:', error);
      }
    },

    procesarConflictos(data) {
      this.conflictosDetectados = data.conflictos || [];
      this.alertas = [];
      
      // Generar alertas basadas en conflictos
      if (data.conflictos && data.conflictos.length > 0) {
        this.alertas.push({
          id: 'conflict_warning',
          tipo: 'warning',
          titulo: 'Conflictos de Horario Detectados',
          mensaje: `Se encontraron ${data.conflictos.length} conflicto(s) de horario con trabajadores asignados.`,
          detalles: 'Revise la disponibilidad de los trabajadores en las fechas seleccionadas.'
        });
      }
      
      // Actualizar información de trabajadores con conflictos
      this.actualizarTrabajadoresConConflictos(data.trabajadores_conflictos || []);
    },

    actualizarTrabajadoresConConflictos(trabajadoresConflictos) {
      this.allWorkers = this.allWorkers.map(worker => {
        const conflictos = trabajadoresConflictos.filter(tc => tc.usuario_id === worker.id);
        return {
          ...worker,
          conflictos: conflictos,
          disponible: conflictos.length === 0
        };
      });
      
      this.categorizeWorkers();
    },

    // Métodos de utilidad para trabajadores
    categorizeWorkers() {
      this.availableWorkers = this.allWorkers.filter(w => w.disponible && w.activo);
      this.busyWorkers = this.allWorkers.filter(w => !w.disponible && w.activo);
    },

    getWorkerStatus(usuario) {
      if (!usuario.activo) return 'Inactivo';
      if (!usuario.disponible) return 'Ocupado';
      if (usuario.conflictos && usuario.conflictos.length > 0) return 'Conflicto';
      return 'Disponible';
    },

    getWorkerStatusClass(usuario) {
      const status = this.getWorkerStatus(usuario);
      switch (status) {
        case 'Disponible': return 'status-available';
        case 'Ocupado': return 'status-busy';
        case 'Conflicto': return 'status-conflict';
        case 'Inactivo': return 'status-inactive';
        default: return 'status-unknown';
      }
    },

    isWorkerAssigned(usuarioId) {
      return this.pedido.trabajadores_asignados.includes(usuarioId);
    },

    viewWorkerCalendar(usuarioId) {
      // Emitir evento para abrir calendario del trabajador
      this.$emit('view-calendar', { usuarioId, type: 'worker' });
    },

    removeWorker(usuarioId) {
      this.pedido.trabajadores_asignados = this.pedido.trabajadores_asignados.filter(id => id !== usuarioId);
      this.calculateWorkload();
    },

    // Cálculo de capacidad y sobrecarga
    async calculateWorkload() {
      if (!this.pedido.horas_estimadas || this.pedido.trabajadores_asignados.length === 0) {
        this.capacidadDisponible = 0;
        this.hayRiesgoSobrecarga = false;
        return;
      }
      
      try {
        const response = await fetch('/api/capacidad/calcular', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trabajadores: this.pedido.trabajadores_asignados,
            fecha_inicio: this.pedido.fecha_inicio,
            fecha_fin: this.pedido.fecha_fin
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.capacidadDisponible = data.capacidad_total;
          this.hayRiesgoSobrecarga = data.capacidad_total < this.pedido.horas_estimadas;
          
          if (this.hayRiesgoSobrecarga) {
            await this.loadRecomendacionTemporal();
            this.generarAlertaSobrecarga();
          }
        }
      } catch (error) {
        console.error('Error al calcular capacidad:', error);
        this.calcularCapacidadFallback();
      }
    },

    calcularCapacidadFallback() {
      // Asumiendo 8 horas por día por trabajador
      const diasTrabajo = this.calcularDiasTrabajo();
      this.capacidadDisponible = this.pedido.trabajadores_asignados.length * diasTrabajo * 8;
      this.hayRiesgoSobrecarga = this.capacidadDisponible < this.pedido.horas_estimadas;
      
      if (this.hayRiesgoSobrecarga) {
        this.generarRecomendacionTemporalFallback();
        this.generarAlertaSobrecarga();
      }
    },

    calcularDiasTrabajo() {
      if (!this.pedido.fecha_inicio || !this.pedido.fecha_fin) return 1;
      
      const inicio = new Date(this.pedido.fecha_inicio);
      const fin = new Date(this.pedido.fecha_fin);
      const diffTime = Math.abs(fin - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(1, diffDays);
    },

    generarAlertaSobrecarga() {
      const deficit = this.pedido.horas_estimadas - this.capacidadDisponible;
      
      this.alertas.push({
        id: 'overload_warning',
        tipo: 'error',
        titulo: 'Riesgo de Sobrecarga Detectado',
        mensaje: `El proyecto requiere ${this.pedido.horas_estimadas}h, pero el equipo solo puede cubrir ${this.capacidadDisponible}h.`,
        detalles: `Déficit: ${deficit}h. Se recomienda contratar personal temporal o ajustar el cronograma.`
      });
    },

    async loadRecomendacionTemporal() {
      try {
        const deficit = this.pedido.horas_estimadas - this.capacidadDisponible;
        
        const response = await fetch('/api/personal-temporal/recomendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            horas_deficit: deficit,
            proyecto_id: this.pedido.proyecto_asociado,
            fecha_inicio: this.pedido.fecha_inicio,
            fecha_fin: this.pedido.fecha_fin,
            habilidades_requeridas: this.getHabilidadesRequeridas()
          })
        });
        
        if (response.ok) {
          this.recomendacionTemporal = await response.json();
        }
      } catch (error) {
        console.error('Error al cargar recomendación temporal:', error);
        this.generarRecomendacionTemporalFallback();
      }
    },

    generarRecomendacionTemporalFallback() {
      const deficit = this.pedido.horas_estimadas - this.capacidadDisponible;
      const diasNecesarios = Math.ceil(deficit / 8);
      
      this.recomendacionTemporal = {
        perfil: 'Técnico Industrial',
        habilidades: ['Soldadura', 'Mecánica Industrial', 'Lectura de planos'],
        duracion_dias: diasNecesarios,
        costo_diario: 150,
        costo_total: diasNecesarios * 150,
        disponibilidad: '2-3 días para conseguir',
        nivel_experiencia: 'Intermedio'
      };
    },

    // ==================== MÉTODOS DE SUGERENCIAS ====================

    async loadSugerenciasAlternativas(conflictos) {
      if (conflictos.length === 0) {
        this.sugerenciasAlternativas = [];
        return;
      }
      
      try {
        const response = await fetch('/api/sugerencias/alternativas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conflictos: conflictos,
            proyecto_id: this.pedido.proyecto_asociado,
            horas_requeridas: this.pedido.horas_estimadas,
            fecha_inicio: this.pedido.fecha_inicio,
            fecha_fin: this.pedido.fecha_fin
          })
        });
        
        if (response.ok) {
          this.sugerenciasAlternativas = await response.json();
        }
      } catch (error) {
        console.error('Error al cargar sugerencias:', error);
        this.sugerenciasAlternativas = this.generateFallbackSuggestions();
      }
    },

    generateFallbackSuggestions() {
      return [
        {
          id: 1,
          tipo: 'time_shift',
          titulo: 'Ajustar Horario',
          descripcion: 'Cambiar las fechas del proyecto para evitar conflictos',
          score: 85,
          ventajas: 'Mantiene el mismo equipo de trabajo',
          desventajas: 'Puede afectar la fecha de entrega',
          accion: {
            tipo: 'ajustar_fechas',
            fecha_inicio_sugerida: this.calcularNuevaFechaInicio(),
            fecha_fin_sugerida: this.calcularNuevaFechaFin()
          }
        },
        {
          id: 2,
          tipo: 'team_change',
          titulo: 'Cambiar Trabajadores',
          descripcion: 'Asignar trabajadores alternativos disponibles',
          score: 75,
          ventajas: 'Mantiene las fechas originales',
          desventajas: 'Puede requerir tiempo de adaptación',
          accion: {
            tipo: 'cambiar_trabajadores',
            trabajadores_sugeridos: this.getTrabajadoresAlternativos()
          }
        }
      ];
    },

    getSuggestionIcon(tipo) {
      const icons = {
        'time_shift': 'schedule',
        'team_change': 'swap_horiz',
        'resource_change': 'build',
        'scope_reduction': 'trending_down',
        'default': 'lightbulb'
      };
      return icons[tipo] || icons.default;
    },

    applySuggestion(sugerencia) {
      switch (sugerencia.accion.tipo) {
        case 'ajustar_fechas':
          this.pedido.fecha_inicio = sugerencia.accion.fecha_inicio_sugerida;
          this.pedido.fecha_fin = sugerencia.accion.fecha_fin_sugerida;
          break;
        case 'cambiar_trabajadores':
          this.pedido.trabajadores_asignados = sugerencia.accion.trabajadores_sugeridos;
          break;
      }
      
      // Remover la sugerencia aplicada
      this.sugerenciasAlternativas = this.sugerenciasAlternativas.filter(s => s.id !== sugerencia.id);
      
      // Recalcular conflictos
      this.checkConflicts();
    },

    // ==================== MÉTODOS PARA CONTRATACIÓN TEMPORAL ====================

    viewTempProfile() {
      // Mostrar modal con perfil completo
      this.$emit('view-temp-profile', this.recomendacionTemporal);
    },

    async generateJobPosting() {
      try {
        const response = await fetch('/api/job-posting/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            perfil: this.recomendacionTemporal.perfil,
            habilidades: this.recomendacionTemporal.habilidades,
            duracion: this.recomendacionTemporal.duracion_dias,
            fecha_inicio: this.pedido.fecha_inicio,
            proyecto: this.getProyectoName(this.pedido.proyecto_asociado),
            salario_ofrecido: this.recomendacionTemporal.costo_diario
          })
        });
        
        if (response.ok) {
          const jobPosting = await response.json();
          this.$emit('job-posting-created', jobPosting);
          
          this.alertas.push({
            id: 'job_posting_created',
            tipo: 'success',
            titulo: 'Solicitud de Empleo Generada',
            mensaje: `Se ha creado automáticamente la solicitud de empleo #${jobPosting.id}`,
            detalles: 'La solicitud ha sido enviada a plataformas de reclutamiento.'
          });
        }
      } catch (error) {
        console.error('Error al generar job posting:', error);
        this.alertas.push({
          id: 'job_posting_error',
          tipo: 'error',
          titulo: 'Error al Generar Solicitud',
          mensaje: 'No se pudo crear la solicitud de empleo automáticamente.',
          detalles: 'Intente nuevamente o cree la solicitud manualmente.'
        });
      }
    },

    // ==================== MÉTODOS PARA ALERTAS ====================

    getAlertIcon(tipo) {
      const icons = {
        'success': 'check_circle',
        'warning': 'warning',
        'error': 'error',
        'info': 'info',
        'default': 'notifications'
      };
      return icons[tipo] || icons.default;
    },

    dismissAlert(alertaId) {
      this.alertas = this.alertas.filter(a => a.id !== alertaId);
    },

    // ==================== MÉTODOS DE ESTADO DE CARGA DE TRABAJO ====================

    getWorkloadStatus() {
      if (!this.pedido.horas_estimadas || this.capacidadDisponible === 0) {
        return 'Sin calcular';
      }
      
      const ratio = this.capacidadDisponible / this.pedido.horas_estimadas;
      
      if (ratio >= 1.2) return 'Capacidad Sobrada';
      if (ratio >= 1.0) return 'Capacidad Adecuada';
      if (ratio >= 0.8) return 'Capacidad Ajustada';
      if (ratio >= 0.6) return 'Capacidad Insuficiente';
      return 'Sobrecarga Crítica';
    },

    getWorkloadStatusClass() {
      const status = this.getWorkloadStatus();
      switch (status) {
        case 'Capacidad Sobrada': return 'workload-excellent';
        case 'Capacidad Adecuada': return 'workload-good';
        case 'Capacidad Ajustada': return 'workload-fair';
        case 'Capacidad Insuficiente': return 'workload-poor';
        case 'Sobrecarga Crítica': return 'workload-critical';
        default: return 'workload-unknown';
      }
    },

    // ==================== MÉTODOS DE UTILIDAD ADICIONALES ====================

    initializeWorkloadCalculation() {
      if (this.pedido.horas_estimadas && this.pedido.trabajadores_asignados.length > 0) {
        this.calculateWorkload();
      }
    },

    calcularNuevaFechaInicio() {
      // Sugerir fecha 1 semana después
      const fecha = new Date(this.pedido.fecha_inicio);
      fecha.setDate(fecha.getDate() + 7);
      return fecha.toISOString().split('T')[0];
    },

    calcularNuevaFechaFin() {
      // Mantener la misma duración
      const inicio = new Date(this.pedido.fecha_inicio);
      const fin = new Date(this.pedido.fecha_fin);
      const duracion = fin - inicio;
      
      const nuevaFechaInicio = new Date(this.calcularNuevaFechaInicio());
      const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracion);
      
      return nuevaFechaFin.toISOString().split('T')[0];
    },

    getTrabajadoresAlternativos() {
      return this.availableWorkers.slice(0, this.pedido.trabajadores_asignados.length).map(w => w.id);
    },

    getHabilidadesRequeridas() {
      // Obtener habilidades del proyecto o tipo de pedido
      const proyecto = this.proyectos.find(p => p.id === this.pedido.proyecto_asociado);
      return proyecto?.habilidades_requeridas || ['Técnico General'];
    },

    getProyectoName(proyectoId) {
      const proyecto = this.proyectos.find(p => p.id === proyectoId);
      return proyecto?.nombre || 'Proyecto no especificado';
    },

    formatDateRange(fechaInicio, fechaFin) {
      const inicio = new Date(fechaInicio).toLocaleDateString();
      const fin = new Date(fechaFin).toLocaleDateString();
      return `${inicio} - ${fin}`;
    },

    // ==================== MÉTODOS DE CARGA DE PROYECTOS (ORIGINAL) ====================

    async loadProyectos() {
      try {
        const response = await fetch('/api/proyectos');
        if (response.ok) {
          this.proyectos = await response.json();
        } else {
          this.proyectos = [
            { id: 1, nombre: 'Reparación Maquinaria Industrial', cliente: 'Empresa ABC' },
            { id: 2, nombre: 'Fabricación de Estructura Metálica', cliente: 'Constructora XYZ' }
          ];
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        this.proyectos = [];
      }
    },

    // ==================== MÉTODOS DE VALIDACIÓN Y GUARDADO ====================

    close() {
      this.$emit('close');
    },

    async save() {
      if (this.validateForm()) {
        this.saving = true;
        try {
          if (this.newFiles.length > 0) {
            await this.processNewFiles();
          }
          
          this.$emit('save', this.pedido);
        } catch (error) {
          console.error('Error al guardar:', error);
          this.showError('Error al guardar la orden de trabajo');
        } finally {
          this.saving = false;
        }
      }
    },

    validateForm() {
      const errors = [];
      
      if (!this.pedido.codigo_pedido.trim()) errors.push('Ingrese un código de pedido');
      if (!this.pedido.tipo_pedido_id) errors.push('Seleccione un tipo de pedido');
      if (!this.pedido.proyecto_asociado) errors.push('Seleccione un proyecto');
      if (!this.pedido.fecha_inicio) errors.push('Seleccione fecha de inicio');
      if (!this.pedido.fecha_fin) errors.push('Seleccione fecha de fin');
      if (!this.pedido.fecha_requerida) errors.push('Seleccione fecha requerida');
      if (!this.pedido.horas_estimadas || this.pedido.horas_estimadas <= 0) {
        errors.push('Ingrese las horas estimadas');
      }
      if (!this.pedido.precio_final || this.pedido.precio_final <= 0) {
        errors.push('Ingrese un precio final válido');
      }
      
      // Validación de fechas
      if (this.pedido.fecha_inicio && this.pedido.fecha_fin) {
        if (new Date(this.pedido.fecha_fin) <= new Date(this.pedido.fecha_inicio)) {
          errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      
      if (this.pedido.costo_estimado && this.pedido.precio_final <= this.pedido.costo_estimado) {
        errors.push('El precio final debe ser mayor que el costo estimado');
      }
      
      if (this.pedido.fecha_estimada_entrega && this.pedido.fecha_requerida) {
        if (new Date(this.pedido.fecha_estimada_entrega) < new Date(this.pedido.fecha_requerida)) {
          errors.push('La fecha estimada de entrega no puede ser anterior a la fecha requerida');
        }
      }
      
      if (!this.pedido.trabajadores_asignados || this.pedido.trabajadores_asignados.length === 0) {
        errors.push('Asigne al menos un trabajador');
      }
      
      // Validación de sobrecarga
      if (this.hayRiesgoSobrecarga && !this.recomendacionTemporal) {
        errors.push('El proyecto tiene riesgo de sobrecarga. Considere ajustar fechas, trabajadores o contratar personal temporal.');
      }
      
      // Validación de conflictos críticos
      const conflictosCriticos = this.conflictosDetectados.filter(c => c.criticidad === 'alta');
      if (conflictosCriticos.length > 0) {
        errors.push(`Existen ${conflictosCriticos.length} conflicto(s) crítico(s) de horario que deben resolverse antes de guardar.`);
      }
      
      // Validación de materiales
      this.pedido.materiales.forEach((mat, index) => {
        const material = this.materialOptions.find(m => m.id === mat.id);
        if (!material) {
          errors.push(`Material #${index + 1}: Material no encontrado`);
        } else if (mat.cantidad <= 0) {
          errors.push(`Material #${index + 1}: Cantidad debe ser mayor a 0`);
        } else if (mat.cantidad > material.stock) {
          errors.push(`Material #${index + 1}: Cantidad excede el stock disponible (${material.stock} ${material.unidad})`);
        }
      });
      
      if (errors.length > 0) {
        this.showError('Errores de validación:\n' + errors.join('\n'));
        return false;
      }
      return true;
    },

    showError(message) {
      if (this.$toast) {
        this.$toast.error(message);
      } else {
        alert(message);
      }
    },

    showSuccess(message) {
      if (this.$toast) {
        this.$toast.success(message);
      } else {
        alert(message);
      }
    },

    // ==================== MÉTODOS PARA ARCHIVOS PDF ====================

    handleDrop(e) {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    },

    handleFileChange(e) {
      const files = e.target.files;
      this.handleFiles(files);
    },

    handleFiles(files) {
      const validFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024
      );
      
      if (validFiles.length !== files.length) {
        this.showError('Algunos archivos no son PDF o exceden el tamaño máximo de 10MB');
      }
      
      this.newFiles = [...this.newFiles, ...validFiles];
      this.previewNewFiles();
    },

    previewNewFiles() {
      this.newFiles.forEach(file => {
        if (!this.pedido.planos) {
          this.$set(this.pedido, 'planos', []);
        }
        
        this.pedido.planos.push({
          nombre_archivo: file.name,
          tamaño: file.size,
          fecha_subida: new Date().toISOString(),
          file: file
        });
      });
      
      this.newFiles = [];
    },

    removeBlueprint(index) {
      this.pedido.planos.splice(index, 1);
    },

    // ==================== MÉTODOS DE UTILIDAD ====================

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    getUsuarioName(usuarioId) {
      const usuario = this.allWorkers.find(u => u.id === usuarioId);
      return usuario ? `${usuario.nombres} ${usuario.apellidos}` : '';
    },

    getHerramientaIcon(tipo) {
      const iconMap = {
        'Equipo': 'precision_manufacturing',
        'Equipo CNC': 'precision_manufacturing',
        'Soldadura': 'handyman',
        'Torno': 'settings',
        'Horno': 'local_fire_department',
        'Herramienta': 'build',
        'default': 'handyman'
      };
      return iconMap[tipo] || iconMap.default;
    },

    // ==================== MÉTODOS PARA MATERIALES (MEJORADOS) ====================

    isMaterialSelected(materialId) {
      return this.pedido.materiales.some(m => m.id === materialId);
    },

    getAddedQuantity(materialId) {
      const material = this.pedido.materiales.find(m => m.id === materialId);
      return material ? material.cantidad : 0;
    },

    incrementMaterial(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty < material.stock) {
        this.updateMaterial(material, currentQty + 1);
      }
    },

    decrementMaterial(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty > 0) {
        this.updateMaterial(material, currentQty - 1);
      }
    },

    updateMaterialQuantity(material, event) {
      let newQty = parseInt(event.target.value) || 0;
      newQty = Math.max(0, Math.min(newQty, material.stock));
      this.updateMaterial(material, newQty);
    },

    updateMaterial(material, quantity) {
      const index = this.pedido.materiales.findIndex(m => m.id === material.id);
      
      if (index >= 0) {
        if (quantity > 0) {
          this.pedido.materiales[index].cantidad = quantity;
        } else {
          this.pedido.materiales.splice(index, 1);
        }
      } else if (quantity > 0) {
        this.pedido.materiales.push({
          id: material.id,
          cantidad: quantity
        });
      }
    },

    toggleMaterial(material) {
      if (this.isMaterialSelected(material.id)) {
        this.removeMaterialFromList(material.id);
      } else {
        this.addMaterialToList(material);
      }
    },

    addMaterialToList(material) {
      const currentQty = this.getAddedQuantity(material.id);
      if (currentQty <= 0) {
        this.updateMaterial(material, 1);
      }
    },

    removeMaterialFromList(materialId) {
      const index = this.pedido.materiales.findIndex(m => m.id === materialId);
      if (index >= 0) {
        this.pedido.materiales.splice(index, 1);
      }
    },

    editMaterialQuantity(material) {
      const maxQty = this.getMaterialStock(material.id);
      const currentQty = material.cantidad;
      
      // Simulación de prompt (en un proyecto real usarías un modal)
      const newQty = prompt(
        `Ingrese la nueva cantidad para ${this.getMaterialName(material.id)} (máx: ${maxQty}):`,
        currentQty
      );
      
      if (newQty !== null) {
        const quantity = parseInt(newQty);
        if (quantity > 0 && quantity <= maxQty) {
          const materialRef = this.materialOptions.find(m => m.id === material.id);
          this.updateMaterial(materialRef, quantity);
        } else {
          this.showError(`La cantidad debe estar entre 1 y ${maxQty}`);
        }
      }
    },

    removeMaterial(index) {
      this.pedido.materiales.splice(index, 1);
    },

    getMaterialName(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.nombre : 'Material desconocido';
    },

    getMaterialStock(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.stock : 0;
    },

    getMaterialUnit(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.unidad : 'unidades';
    },

    getMaterialPrice(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId);
      return material ? material.precio || 0 : 0;
    },

    calculateMaterialCost() {
      return this.pedido.materiales.reduce((total, mat) => {
        const precio = this.getMaterialPrice(mat.id);
        return total + (precio * mat.cantidad);
      }, 0);
    },

    truncateDescription(text, maxLength = 60) {
      if (!text) return '';
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    },

    // ==================== MÉTODOS DE FORMATEO Y UTILIDADES FINALES ====================

    formatCurrency(amount) {
      return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ'
      }).format(amount);
    },

    formatNumber(number) {
      return new Intl.NumberFormat('es-GT').format(number);
    },

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    // Método para verificar si hay cambios sin guardar
    hasUnsavedChanges() {
      // Implementar lógica para detectar cambios
      return this.newFiles.length > 0 || this.alertas.some(a => a.tipo === 'warning');
    }
  }
}