import axios from 'axios';

// Configuración base de la API
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // Cambiar en producción
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Interceptor para manejar respuestas y errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    // Log para desarrollo (remover en producción)
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    // Log del error completo
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data
    });

    // Manejar errores comunes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expirado o no válido
          console.warn('🔒 Token expirado o no válido');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          // Redirigir al login si es necesario
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.warn('🚫 Acceso denegado');
          break;
          
        case 404:
          console.warn('🔍 Recurso no encontrado');
          break;
          
        case 422:
          console.warn('📝 Error de validación');
          break;
          
        case 500:
          console.error('🔥 Error interno del servidor');
          break;
          
        default:
          console.error(`⚠️ Error HTTP ${error.response.status}`);
      }
    } else if (error.request) {
      // Error de red
      console.error('🌐 Error de conexión con el servidor');
    } else {
      // Error de configuración
      console.error('⚙️ Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Wrapper para manejar respuestas de la API de forma consistente
 * @param {Function} apiCall - Función que retorna una promesa de axios
 * @returns {Object} - { success, data, error, message }
 */
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    
    // Verificar si la respuesta tiene el formato estándar { success, data, message }
    if (response.data && typeof response.data === 'object') {
      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data || response.data,
          message: response.data.message || 'Operación exitosa'
        };
      }
    }
    
    // Para respuestas que solo contienen los datos directamente
    return {
      success: true,
      data: response.data,
      message: 'Operación exitosa'
    };
    
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: error.response?.data?.message || 
               error.response?.data?.error || 
               error.message || 
               'Error desconocido'
    };
  }
};

/**
 * Función helper para construir URLs de API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros para la URL
 * @returns {string} - URL completa
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Agregar parámetros de query si existen
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  return url;
};

/**
 * Funciones de utilidad para diferentes tipos de peticiones HTTP
 */
export const apiUtils = {
  // GET request
  get: (url, params = {}) => {
    const fullUrl = buildApiUrl(url, params);
    return handleApiResponse(() => apiClient.get(fullUrl));
  },

  // POST request
  post: (url, data = {}) => {
    return handleApiResponse(() => apiClient.post(url, data));
  },

  // PUT request
  put: (url, data = {}) => {
    return handleApiResponse(() => apiClient.put(url, data));
  },

  // PATCH request
  patch: (url, data = {}) => {
    return handleApiResponse(() => apiClient.patch(url, data));
  },

  // DELETE request
  delete: (url) => {
    return handleApiResponse(() => apiClient.delete(url));
  }
};

/**
 * Maneja errores de servicios de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} operation - Nombre de la operación que falló
 * @returns {Object} - Información del error formateada
 */
export const handleServiceError = (error, operation = 'operación') => {
  let message = `Error al ${operation}`;
  let statusCode = null;
  let errorData = null;

  if (error.response) {
    // Error de respuesta del servidor
    statusCode = error.response.status;
    errorData = error.response.data;
    
    if (errorData && errorData.message) {
      message = errorData.message;
    } else if (errorData && errorData.error) {
      message = errorData.error;
    } else {
      switch (statusCode) {
        case 400:
          message = `Solicitud inválida al ${operation}`;
          break;
        case 401:
          message = 'No autorizado para realizar esta operación';
          break;
        case 403:
          message = 'No tienes permisos para realizar esta operación';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 409:
          message = 'Conflicto: el recurso ya existe o hay datos duplicados';
          break;
        case 422:
          message = 'Datos de entrada inválidos';
          break;
        case 500:
          message = 'Error interno del servidor';
          break;
        default:
          message = `Error del servidor (${statusCode}) al ${operation}`;
      }
    }
  } else if (error.request) {
    // Error de red
    message = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
  } else {
    // Error de configuración u otro
    message = error.message || `Error desconocido al ${operation}`;
  }

  return {
    message,
    statusCode,
    errorData,
    originalError: error
  };
};

/**
 * Valida la respuesta de un servicio
 * @param {Object} response - Respuesta del servicio
 * @param {string} defaultErrorMessage - Mensaje de error por defecto
 * @returns {Object} - { isValid, data, message }
 */
export const validateServiceResponse = (response, defaultErrorMessage = 'Error en la respuesta del servicio') => {
  // Verificar si la respuesta existe
  if (!response) {
    return {
      isValid: false,
      data: null,
      message: 'No se recibió respuesta del servidor'
    };
  }

  // Verificar si la respuesta indica éxito
  if (response.success === false) {
    return {
      isValid: false,
      data: null,
      message: response.message || defaultErrorMessage
    };
  }

  // Si la respuesta tiene success: true
  if (response.success === true) {
    return {
      isValid: true,
      data: response.data,
      message: response.message || 'Operación exitosa'
    };
  }

  // Para respuestas que no tienen el campo success pero tienen datos
  if (response.data !== undefined) {
    return {
      isValid: true,
      data: response.data,
      message: response.message || 'Operación exitosa'
    };
  }

  // Si llegamos aquí, la respuesta no tiene el formato esperado
  return {
    isValid: false,
    data: null,
    message: defaultErrorMessage
  };
};

export default apiClient;
export { API_CONFIG };
