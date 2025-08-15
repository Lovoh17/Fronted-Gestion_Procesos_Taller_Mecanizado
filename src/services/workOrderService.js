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
   * @param {Object} data - Datos de la orden de trabajo
   * @returns {Promise<Object>} - Orden de trabajo creada
   */
  async create(data) {
    return await apiUtils.post('/api/Pedido', data);
  },

  /**
   * Actualizar una orden de trabajo existente
   * @param {number|string} id - ID de la orden
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Orden de trabajo actualizada
   */
  async update(id, data) {
    return await apiUtils.put(`/api/Pedido/${id}`, data);
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
