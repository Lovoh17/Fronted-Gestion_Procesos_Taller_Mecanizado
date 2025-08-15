import { apiUtils } from './config.js';

/**
 * Servicio de gestión de mantenimiento - Operaciones CRUD básicas
 */
export const maintenanceService = {
  /**
   * Obtener todos los mantenimientos
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} - Lista de mantenimientos
   */
  async getAll(filters = {}) {
    return await apiUtils.get('/api/Mantenimiento', filters);
  },

  /**\n   * Obtener un mantenimiento por ID
   * @param {number|string} id - ID del mantenimiento
   * @returns {Promise<Object>} - Datos del mantenimiento
   */
  async getById(id) {
    return await apiUtils.get(`/api/Mantenimiento/${id}`);
  },

  /**
   * Crear nuevo mantenimiento
   * @param {Object} maintenanceData - Datos del mantenimiento
   * @returns {Promise<Object>} - Mantenimiento creado
   */
  async create(maintenanceData) {
    const payload = {
      nombre: maintenanceData.nombre?.trim(),
      herramienta_id: maintenanceData.herramienta_id,
      tipo_mantenimiento_id: maintenanceData.tipo_mantenimiento_id,
      fecha_programada: maintenanceData.fecha_programada,
      fecha_inicio: maintenanceData.fecha_inicio || null,
      fecha_fin: maintenanceData.fecha_fin || null,
      estado_id: maintenanceData.estado_id || "1",
      prioridad_id: maintenanceData.prioridad_id || "3",
      costo_estimado: maintenanceData.costo_estimado ? parseFloat(maintenanceData.costo_estimado).toFixed(2) : "0.00",
      costo_real: maintenanceData.costo_real ? parseFloat(maintenanceData.costo_real).toFixed(2) : null,
      tecnico_asignado_id: maintenanceData.tecnico_asignado_id || null,
      descripcion_problema: maintenanceData.descripcion_problema?.trim() || null,
      acciones_realizadas: maintenanceData.acciones_realizadas?.trim() || null,
      repuestos_utilizados: maintenanceData.repuestos_utilizados || null,
      horas_trabajo: maintenanceData.horas_trabajo || null,
      mantenimiento_hecho_por: maintenanceData.mantenimiento_hecho_por || null,
      actualizado_por: maintenanceData.actualizado_por || null
    };

    return await apiUtils.post('/api/Mantenimiento', payload);
  },

  /**
   * Actualizar mantenimiento
   * @param {number|string} id - ID del mantenimiento
   * @param {Object} maintenanceData - Datos actualizados
   * @returns {Promise<Object>} - Mantenimiento actualizado
   */
  async update(id, maintenanceData) {
    return await apiUtils.put(`/api/Mantenimiento/${id}`, maintenanceData);
  },

  /**
   * Eliminar mantenimiento
   * @param {number|string} id - ID del mantenimiento
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id) {
    return await apiUtils.delete(`/api/Mantenimiento/${id}`);
  }
};

export default maintenanceService;
