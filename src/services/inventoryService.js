import { apiUtils } from './config.js';

/**
 * Servicio de gestión de inventario - Operaciones CRUD básicas
 */
export const inventoryService = {
  /**
   * Obtener todas las materias primas
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} - Lista de materias primas
   */
  async getAllMateriasPrimas(filters = {}) {
    return await apiUtils.get('/api/MateriaPrima', filters);
  },

  /**
   * Obtener materia prima por ID
   * @param {number|string} id - ID de la materia prima
   * @returns {Promise<Object>} - Datos de la materia prima
   */
  async getMateriaPrimaById(id) {
    return await apiUtils.get(`/api/MateriaPrima/${id}`);
  },

  /**
   * Crear nueva materia prima
   * @param {Object} materiaData - Datos de la materia prima
   * @returns {Promise<Object>} - Materia prima creada
   */
  async createMateriaPrima(materiaData) {
    const payload = {
      codigo: materiaData.codigo?.trim(),
      nombre: materiaData.nombre?.trim(),
      descripcion: materiaData.descripcion?.trim(),
      tipo_materia_prima_id: materiaData.tipo_materia_prima_id,
      unidad_base_id: materiaData.unidad_base_id,
      stock_minimo: materiaData.stock_minimo ? parseFloat(materiaData.stock_minimo).toString() : "0",
      stock_maximo: materiaData.stock_maximo ? parseFloat(materiaData.stock_maximo).toString() : "100",
      unidades_completas: materiaData.unidades_completas ? parseFloat(materiaData.unidades_completas).toString() : "0",
      fracciones: materiaData.fracciones ? parseFloat(materiaData.fracciones).toString() : "0",
      fraccion_unidad_id: materiaData.fraccion_unidad_id || materiaData.unidad_base_id,
      permite_fraccion: Boolean(materiaData.permite_fraccion),
      pertenece_a_stock_id: materiaData.pertenece_a_stock_id || 1,
      costo_unitario: materiaData.costo_unitario ? parseFloat(materiaData.costo_unitario).toFixed(2) : "0.00",
      proveedor_principal: materiaData.proveedor_principal?.trim(),
      tiempo_reposicion: materiaData.tiempo_reposicion || 7,
      es_controlado: Boolean(materiaData.es_controlado)
    };

    // Calcular stock total automáticamente
    const stockTotal = parseFloat(payload.unidades_completas) + parseFloat(payload.fracciones);
    payload.stock_total = stockTotal.toString();

    return await apiUtils.post('/api/MateriaPrima', payload);
  },

  /**
   * Actualizar materia prima
   * @param {number|string} id - ID de la materia prima
   * @param {Object} materiaData - Datos actualizados
   * @returns {Promise<Object>} - Materia prima actualizada
   */
  async updateMateriaPrima(id, materiaData) {
    return await apiUtils.put(`/api/MateriaPrima/${id}`, materiaData);
  },

  /**
   * Eliminar materia prima
   * @param {number|string} id - ID de la materia prima
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteMateriaPrima(id) {
    return await apiUtils.delete(`/api/MateriaPrima/${id}`);
  }
};

export default inventoryService;
