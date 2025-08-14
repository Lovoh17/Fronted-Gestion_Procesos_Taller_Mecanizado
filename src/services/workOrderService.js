import { apiUtils } from './config.js';

/**
 * Servicio de gestión de órdenes de trabajo - Operaciones CRUD básicas
 */
export const workOrderService = {
  /**
   * Obtener todas las órdenes de trabajo
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} - Lista de órdenes de trabajo
   */
  async getAll(filters = {}) {
    return await apiUtils.get('/api/Pedido', filters);
  },

  /**
   * Obtener una orden de trabajo por ID
   * @param {number|string} id - ID de la orden
   * @returns {Promise<Object>} - Datos de la orden de trabajo
   */
  async getById(id) {
    return await apiUtils.get(`/api/Pedido/${id}`);
  },

  /**
   * Crear una nueva orden de trabajo
   * @param {Object} orderData - Datos de la orden de trabajo
   * @returns {Promise<Object>} - Orden de trabajo creada
   */
  async create(orderData) {
    const payload = {
      codigo_pedido: orderData.codigo_pedido?.trim(),
      tipo_pedido_id: orderData.tipo_pedido_id || 1,
      plano_id: orderData.plano_id ? orderData.plano_id.toString() : null,
      solicitante_id: orderData.solicitante_id ? orderData.solicitante_id.toString() : null,
      aprobador_id: orderData.aprobador_id ? orderData.aprobador_id.toString() : null,
      supervisor_id: orderData.supervisor_id ? orderData.supervisor_id.toString() : null,
      fecha_solicitud: orderData.fecha_solicitud || new Date().toISOString(),
      fecha_requerida: orderData.fecha_requerida,
      fecha_estimada_entrega: orderData.fecha_estimada_entrega,
      estado_id: orderData.estado_id || 1,
      prioridad: orderData.prioridad || 2,
      proyecto_asociado: orderData.proyecto_asociado?.trim(),
      costo_estimado: orderData.costo_estimado ? parseFloat(orderData.costo_estimado).toFixed(2) : "0.00",
      precio_final: orderData.precio_final ? parseFloat(orderData.precio_final).toFixed(2) : "0.00",
      notas: orderData.notas?.trim() || null
    };

    return await apiUtils.post('/api/Pedido', payload);
  },

  /**
   * Actualizar una orden de trabajo existente
   * @param {number|string} id - ID de la orden
   * @param {Object} orderData - Datos actualizados
   * @returns {Promise<Object>} - Orden de trabajo actualizada
   */
  async update(id, orderData) {
    return await apiUtils.put(`/api/Pedido/${id}`, orderData);
  },

  /**
   * Eliminar una orden de trabajo
   * @param {number|string} id - ID de la orden
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id) {
    return await apiUtils.delete(`/api/Pedido/${id}`);
  },

  /**
   * Cambiar estado de una orden de trabajo
   * @param {number|string} id - ID de la orden
   * @param {number} estadoId - Nuevo estado
   * @returns {Promise<Object>} - Orden actualizada
   */
  async updateStatus(id, estadoId) {
    return await apiUtils.patch(`/api/Pedido/${id}/status`, {
      estado_id: estadoId
    });
  }
};

export default workOrderService;
