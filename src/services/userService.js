import { apiUtils } from './config.js';

/**
 * Servicio de gestión de usuarios - Operaciones CRUD básicas
 */
export const userService = {
  /**
   * Obtener todos los usuarios
   * @param {Object} filters - Filtros para la consulta (opcional)
   * @returns {Promise<Object>} - Lista de usuarios
   */
  async getAll(filters = {}) {
    return await apiUtils.get('/api/Usuario', filters);
  },

  /**
   * Obtener un usuario por ID
   * @param {number|string} id - ID del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  async getById(id) {
    return await apiUtils.get(`/api/Usuario/${id}`);
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  async create(userData) {
    const payload = {
      nombre: userData.nombre?.trim(),
      apellido: userData.apellido?.trim(),
      email: userData.email?.trim().toLowerCase(),
      password: userData.password,
      puesto_id: userData.puesto_id ? userData.puesto_id.toString() : "4",
      estado_id: userData.estado_id !== undefined ? userData.estado_id : 1,
      foto_ruta: userData.foto_ruta || null,
      es_subcontratado: Boolean(userData.es_subcontratado),
      fecha_contratacion: userData.fecha_contratacion || null,
      fecha_termino_contrato: userData.fecha_termino_contrato || null,
      habilidades_tecnicas: userData.habilidades_tecnicas || [],
      turno_id: userData.turno_id || null,
      capacidad_horas_semana: userData.capacidad_horas_semana || 40,
      zona_trabajo_id: userData.zona_trabajo_id ? userData.zona_trabajo_id.toString() : null
    };

    return await apiUtils.post('/api/Usuario', payload);
  },

  /**
   * Actualizar un usuario existente
   * @param {number|string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async update(id, userData) {
    const payload = {
      nombre: userData.nombre?.trim(),
      apellido: userData.apellido?.trim(),
      email: userData.email?.trim().toLowerCase(),
      puesto_id: userData.puesto_id ? userData.puesto_id.toString() : undefined,
      estado_id: userData.estado_id,
      foto_ruta: userData.foto_ruta,
      es_subcontratado: Boolean(userData.es_subcontratado),
      fecha_contratacion: userData.fecha_contratacion,
      fecha_termino_contrato: userData.fecha_termino_contrato,
      habilidades_tecnicas: userData.habilidades_tecnicas || [],
      turno_id: userData.turno_id,
      capacidad_horas_semana: userData.capacidad_horas_semana,
      zona_trabajo_id: userData.zona_trabajo_id ? userData.zona_trabajo_id.toString() : undefined
    };

    if (userData.password?.trim()) {
      payload.password = userData.password;
    }

    // Eliminar campos undefined
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return await apiUtils.put(`/api/Usuario/${id}`, payload);
  },

  /**
   * Eliminar un usuario
   * @param {number|string} id - ID del usuario
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id) {
    return await apiUtils.delete(`/api/Usuario/${id}`);
  },

  /**
   * Cambiar estado de un usuario
   * @param {number|string} id - ID del usuario
   * @param {number} estadoId - Nuevo estado del usuario
   * @returns {Promise<Object>} - Usuario con estado actualizado
   */
  async updateStatus(id, estadoId) {
    return await apiUtils.patch(`/api/Usuario/${id}/status`, {
      estado_id: estadoId
    });
  }
};

export default userService;
