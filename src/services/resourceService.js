import { apiUtils } from './config.js';
import { mockResourceService } from '../mock/rolesData.js';
import { mockConfig } from '../config/mockConfig.js';

// Flag para determinar si usar datos mock
const USE_MOCK_DATA = mockConfig.USE_MOCK_DATA && mockConfig.services.resources;

/**
 * Servicio de gestión de recursos auxiliares - Solo operaciones de lectura
 */
export const resourceService = {
  /**
   * Obtener todos los elementos de un endpoint
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} - Lista de elementos
   */
  async getAll(endpoint, filters = {}) {
    return await apiUtils.get(`/api/${endpoint}`, filters);
  },

  /**
   * Obtener un elemento por ID de un endpoint
   * @param {string} endpoint - Endpoint de la API
   * @param {number|string} id - ID del elemento
   * @returns {Promise<Object>} - Datos del elemento
   */
  async getById(endpoint, id) {
    return await apiUtils.get(`/api/${endpoint}/${id}`);
  },

  // Métodos convenientes para endpoints comunes
  async getRoles(filters = {}) {
    if (USE_MOCK_DATA) {
      return await mockResourceService.getRoles();
    }
    return this.getAll('Puesto', filters);
  },

  async getUserStates(filters = {}) {
    if (USE_MOCK_DATA) {
      return await mockResourceService.getUserStates();
    }
    return this.getAll('EstadoUsuario', filters);
  },

  async getTurnos(filters = {}) {
    if (USE_MOCK_DATA) {
      return await mockResourceService.getTurnos();
    }
    return this.getAll('Turno', filters);
  },

  async getZonasTrabajo(filters = {}) {
    if (USE_MOCK_DATA) {
      return await mockResourceService.getZonasTrabajo();
    }
    return this.getAll('ZonaTrabajo', filters);
  },

  // Alias para compatibilidad con componentes existentes
  async getAllRoles(filters = {}) {
    return this.getRoles(filters);
  },

  async getAllUserStates(filters = {}) {
    return this.getUserStates(filters);
  },

  async getAllTurnos(filters = {}) {
    return this.getTurnos(filters);
  },

  async getAllZonasTrabajo(filters = {}) {
    return this.getZonasTrabajo(filters);
  }
};

export default resourceService;
