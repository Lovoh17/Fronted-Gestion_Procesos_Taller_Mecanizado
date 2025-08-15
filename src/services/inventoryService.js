import { apiUtils } from './config.js';

/**
 * Servicio de gestión de inventario - Operaciones CRUD básicas
 */
export const inventoryService = {
  /**
   * Obtener todos los registros de inventario
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} - Lista de elementos de inventario
   */
  async getAll(filters = {}) {
    return await apiUtils.get('/api/MateriaPrima', filters);
  },

  /**
   * Obtener un elemento de inventario por ID
   * @param {number|string} id - ID del elemento de inventario
   * @returns {Promise<Object>} - Datos del elemento de inventario
   */
  async getById(id) {
    return await apiUtils.get(`/api/MateriaPrima/${id}`);
  },

  /**
   * Crear nuevo elemento de inventario
   * @param {Object} data - Datos del elemento de inventario
   * @returns {Promise<Object>} - Elemento de inventario creado
   */
  async create(data) {
    return await apiUtils.post('/api/MateriaPrima', data);
  },

  /**
   * Actualizar elemento de inventario
   * @param {number|string} id - ID del elemento de inventario
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Elemento de inventario actualizado
   */
  async update(id, data) {
    return await apiUtils.put(`/api/MateriaPrima/${id}`, data);
  },

  /**
   * Eliminar elemento de inventario
   * @param {number|string} id - ID del elemento de inventario
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id) {
    return await apiUtils.delete(`/api/MateriaPrima/${id}`);
  }
};

export default inventoryService;
