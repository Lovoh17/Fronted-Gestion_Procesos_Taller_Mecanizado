import { apiUtils } from './config.js';

/**
 * Servicio de gestión de recursos - Operaciones CRUD básicas
 */
export const resourceService = {
  // ==================== ROLES ====================
  /**
   * Obtener todos los roles
   * @returns {Promise<Object>} - Lista de roles
   */
  async getAllRoles() {
    return await apiUtils.get('/api/Puesto');
  },

  /**
   * Obtener rol por ID
   * @param {number|string} id - ID del rol
   * @returns {Promise<Object>} - Datos del rol
   */
  async getRoleById(id) {
    return await apiUtils.get(`/api/Puesto/${id}`);
  },

  // ==================== ESTADOS DE USUARIO ====================
  /**
   * Obtener todos los estados de usuario
   * @returns {Promise<Object>} - Lista de estados
   */
  async getAllUserStates() {
    return await apiUtils.get('/api/EstadoUsuario');
  },

  /**
   * Obtener estado por ID
   * @param {number|string} id - ID del estado
   * @returns {Promise<Object>} - Datos del estado
   */
  async getUserStateById(id) {
    return await apiUtils.get(`/api/EstadoUsuario/${id}`);
  },

  // ==================== TURNOS ====================
  /**
   * Obtener todos los turnos
   * @returns {Promise<Object>} - Lista de turnos
   */
  async getAllTurnos() {
    return await apiUtils.get('/api/Turno');
  },

  /**
   * Obtener turno por ID
   * @param {number|string} id - ID del turno
   * @returns {Promise<Object>} - Datos del turno
   */
  async getTurnoById(id) {
    return await apiUtils.get(`/api/Turno/${id}`);
  },

  // ==================== ZONAS DE TRABAJO ====================
  /**
   * Obtener todas las zonas de trabajo
   * @returns {Promise<Object>} - Lista de zonas
   */
  async getAllZonasTrabajo() {
    return await apiUtils.get('/api/ZonaTrabajo');
  },

  /**
   * Obtener zona por ID
   * @param {number|string} id - ID de la zona
   * @returns {Promise<Object>} - Datos de la zona
   */
  async getZonaTrabajoById(id) {
    return await apiUtils.get(`/api/ZonaTrabajo/${id}`);
  }
};

export default resourceService;
