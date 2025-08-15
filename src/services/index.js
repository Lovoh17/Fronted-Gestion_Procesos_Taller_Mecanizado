// Configuración y utilidades
export { apiUtils, handleServiceError, validateServiceResponse } from './config.js';

// Servicios principales - CRUD básico
export { userService } from './userService.js';
export { workOrderService } from './workOrderService.js';
export { inventoryService } from './inventoryService.js';
export { maintenanceService } from './maintenanceService.js';
export { resourceService } from './resourceService.js';

// Exportaciones por defecto para compatibilidad
export { default as userServiceDefault } from './userService.js';
export { default as workOrderServiceDefault } from './workOrderService.js';
export { default as inventoryServiceDefault } from './inventoryService.js';
export { default as maintenanceServiceDefault } from './maintenanceService.js';
export { default as resourceServiceDefault } from './resourceService.js';
