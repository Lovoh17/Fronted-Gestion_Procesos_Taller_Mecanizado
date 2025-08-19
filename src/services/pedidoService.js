import { apiUtils } from './config.js';

/**
 * Servicio de gestión de pedidos - Operaciones CRUD básicas
 */
export const pedidoService = {
  /**
   * Obtener todos los pedidos
   * @param {Object} filters - Filtros para la consulta (opcional)
   * @returns {Promise<Object>} - Lista de pedidos
   */
  async getAll(filters = {}) {
    return await apiUtils.get('/Pedido', filters);
  },

  /**
   * Obtener un pedido por ID
   * @param {number|string} id - ID del pedido
   * @returns {Promise<Object>} - Datos del pedido
   */
  async getById(id) {
    return await apiUtils.get(`/Pedido/${id}`);
  },

  /**
   * Crear un nuevo pedido
   * @param {Object} pedidoData - Datos del pedido
   * @returns {Promise<Object>} - Pedido creado
   */
  async create(pedidoData) {
    const payload = {
      codigo_pedido: pedidoData.codigo_pedido?.trim(),
      tipo_pedido_id: pedidoData.tipo_pedido_id,
      plano_id: pedidoData.plano_id,
      solicitante_id: pedidoData.solicitante_id,
      aprobador_id: pedidoData.aprobador_id,
      supervisor_id: pedidoData.supervisor_id,
      fecha_solicitud: pedidoData.fecha_solicitud,
      fecha_aprobacion: pedidoData.fecha_aprobacion,
      fecha_requerida: pedidoData.fecha_requerida,
      fecha_estimada_entrega: pedidoData.fecha_estimada_entrega,
      fecha_completado: pedidoData.fecha_completado,
      estado_id: pedidoData.estado_id || 1,
      pausado_desde: pedidoData.pausado_desde,
      pausado_hasta: pedidoData.pausado_hasta,
      razon_pausa_actual_id: pedidoData.razon_pausa_actual_id,
      contador_pausas: pedidoData.contador_pausas || 0,
      tiempo_total_pausado: pedidoData.tiempo_total_pausado || "0",
      prioridad: pedidoData.prioridad || 2,
      proyecto_asociado: pedidoData.proyecto_asociado?.trim(),
      costo_estimado: pedidoData.costo_estimado,
      costo_real: pedidoData.costo_real,
      precio_final: pedidoData.precio_final,
      notas: pedidoData.notas?.trim()
    };

    return await apiUtils.post('/Pedido', payload);
  },

  /**
   * Actualizar un pedido existente
   * @param {number|string} id - ID del pedido
   * @param {Object} pedidoData - Datos actualizados del pedido
   * @returns {Promise<Object>} - Pedido actualizado
   */
  async update(id, pedidoData) {
    const payload = {
      codigo_pedido: pedidoData.codigo_pedido?.trim(),
      tipo_pedido_id: pedidoData.tipo_pedido_id,
      plano_id: pedidoData.plano_id,
      solicitante_id: pedidoData.solicitante_id,
      aprobador_id: pedidoData.aprobador_id,
      supervisor_id: pedidoData.supervisor_id,
      fecha_solicitud: pedidoData.fecha_solicitud,
      fecha_aprobacion: pedidoData.fecha_aprobacion,
      fecha_requerida: pedidoData.fecha_requerida,
      fecha_estimada_entrega: pedidoData.fecha_estimada_entrega,
      fecha_completado: pedidoData.fecha_completado,
      estado_id: pedidoData.estado_id,
      pausado_desde: pedidoData.pausado_desde,
      pausado_hasta: pedidoData.pausado_hasta,
      razon_pausa_actual_id: pedidoData.razon_pausa_actual_id,
      contador_pausas: pedidoData.contador_pausas,
      tiempo_total_pausado: pedidoData.tiempo_total_pausado,
      prioridad: pedidoData.prioridad,
      proyecto_asociado: pedidoData.proyecto_asociado?.trim(),
      costo_estimado: pedidoData.costo_estimado,
      costo_real: pedidoData.costo_real,
      precio_final: pedidoData.precio_final,
      notas: pedidoData.notas?.trim()
    };

    // Eliminar campos undefined
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return await apiUtils.put(`/Pedido/${id}`, payload);
  },

  /**
   * Eliminar un pedido
   * @param {number|string} id - ID del pedido
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id) {
    return await apiUtils.delete(`/Pedido/${id}`);
  },

  /**
   * Cambiar estado de un pedido
   * @param {number|string} id - ID del pedido
   * @param {number} estadoId - Nuevo estado del pedido
   * @returns {Promise<Object>} - Pedido con estado actualizado
   */
  async updateStatus(id, estadoId) {
    return await apiUtils.patch(`/Pedido/${id}/status`, {
      estado_id: estadoId
    });
  },

  /**
   * Obtener estadísticas de pedidos
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} - Estadísticas de pedidos
   */
  async getStats(filters = {}) {
    return await apiUtils.get('/Pedido/stats', filters);
  },

  /**
   * Obtener pedidos por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} - Lista de pedidos filtrados
   */
  async getByDateRange(fechaInicio, fechaFin) {
    return await apiUtils.get('/Pedido/date-range', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  },

  /**
   * Obtener pedidos por estado
   * @param {number} estadoId - ID del estado
   * @returns {Promise<Object>} - Lista de pedidos del estado especificado
   */
  async getByStatus(estadoId) {
    return await apiUtils.get('/Pedido/by-status', {
      estado_id: estadoId
    });
  },

  /**
   * Obtener pedidos por prioridad
   * @param {number} prioridad - Nivel de prioridad (1: Alta, 2: Media, 3: Baja)
   * @returns {Promise<Object>} - Lista de pedidos de la prioridad especificada
   */
  async getByPriority(prioridad) {
    return await apiUtils.get('/Pedido/by-priority', {
      prioridad: prioridad
    });
  }
};

export default pedidoService;
