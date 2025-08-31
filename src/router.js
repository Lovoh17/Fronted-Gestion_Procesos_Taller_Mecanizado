import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ================== RUTAS PÚBLICAS ==================
  {
    path: '/login',
    name: 'login', 
    component: () => import('@/components/LoginForm.vue'),
    meta: { 
      public: true,
      layout: 'empty'
    }
  },
  {
    path: '/',
    name: 'home', 
    component: () => import('@/components/LoginForm.vue'),
    meta: { 
      public: true,
      layout: 'empty'
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/components/Unauthorized.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/components/NotFound.vue'),
    meta: { public: true }
  },

  // ================== RUTAS COMPARTIDAS ==================
  {
    path: '/herramientas',
    name: 'herramientas',
    component: () => import('@/components/VistasAdmin/Herramientas.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1, 2, 3, 4] // Todos pueden acceder
    }
  },
  {
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1, 2, 3, 4] // Todos pueden acceder
    }
  },
  {
    path: '/settings',
    name: 'settings', 
    component: () => import('./components/settings.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1, 2, 3, 4],
    }
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/components/VistasAdmin/Reports.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1], // Solo admin
    }
  },

  // ================== RUTAS DE ADMIN (puesto_id: 1) ==================
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin-dashboard',
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: () => import('@/components/VistasAdmin/Dashboard.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1],
      defaultRoute: true,
      forPuesto: 1
    }
  },
  {
    path: '/rrhh',
    name: 'rrhh',
    component: () => import('@/components/VistasAdmin/RRHH.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },
  {
    path: '/admin/transacciones',
    name: 'Transacciones',
    component: () => import('@/components/VistasAdmin/Transacciones.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },
  {
    path: '/admin/departments',
    name: 'Departamentos',
    component: () => import('@/components/VistasAdmin/Departamentos.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/components/VistasAdmin/Usuarios.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/components/VistasAdmin/Ordenes.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [1]
    }
  },

  // ================== RUTAS DE COORDINADOR (puesto_id: 2) ==================
  {
    path: '/coordinator',
    name: 'coordinator',
    redirect: '/dashboard-coordinador',
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/dashboard-coordinador',
    name: 'coordinator-dashboard',
    component: () => import('@/components/VistasCoordinador/CoordinadorView.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2],
      defaultRoute: true,
      forPuesto: 2
    }
  },
  {
    path: '/coordinator/new',
    name: 'new-order',
    component: () => import('./components/VistasCoordinador/WorkOrderModal.vue'),
    meta: { public: true }
  },
  {
    path: '/asignaciones',
    name: 'new-order',
    component: () => import('./components/Asiganciones.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/control-calidad',
    name: 'control-calidad',
    component: () => import('@/components/VistasCoordinador/ControlCalidad.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/coordinator/planning',
    name: 'coordinator-planning',
    component: () => import('@/components/VistasCoordinador/ProductionPlanning.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/coordinator/orders',
    name: 'coordinator-orders',
    component: () => import('@/components/VistasCoordinador/WorkOrders.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/coordinator/maintenance',
    name: 'coordinator-maintenance',
    component: () => import('@/components/VistasCoordinador/Maintenance.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/coordinator/movimientos',
    name: 'coordinator-movimientos',
    component: () => import('@/components/VistasCoordinador/Historial_de_Movimientos.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },
  {
    path: '/coordinator/planos-tools',
    name: 'coordinator-Planos-herramientas',
    component: () => import('@/components/VistasCoordinador/Planos_Herraminetas.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [2]
    }
  },

  // ================== RUTAS DE OPERARIO (puesto_id: 3) ==================
  {
    path: '/operator',
    name: 'operator',
    redirect: '/dashboard-operario',
    meta: { 
      requiresAuth: true,
      allowedPuestos: [3]
    }
  },
  {
    path: '/dashboard-operario',
    name: 'operario-dashboard',
    component: () => import('@/components/VistasOperarios/Principal.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [3],
      defaultRoute: true,
      forPuesto: 3
    }
  },
  {
    path: '/operario/trabajos',
    name: 'operario-trabajo',
    component: () => import('@/components/VistasOperarios/Trabajos.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [3]
    }
  },
  {
    path: '/operario/reportes',
    name: 'operario-reportes',
    component: () => import('@/components/VistasOperarios/Reportes.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [3]
    }
  },

  // ================== RUTAS DE TÉCNICO (puesto_id: 4) ==================
  {
    path: '/technician',
    name: 'technician',
    redirect: '/tech-dashboard',
    meta: { 
      requiresAuth: true,
      allowedPuestos: [4]
    }
  },
  {
    path: '/tech-dashboard',
    name: 'dashboard-tecnico',
    component: () => import('@/components/VistasTecnico/DashboardTecnico.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [4],
      defaultRoute: true,
      forPuesto: 4
    }
  },
  {
    path: '/tech/schedule',
    name: 'technician-schedule',
    component: () => import('@/components/VistasTecnico/Programacion.vue'),
    meta: { 
      requiresAuth: true,
      allowedPuestos: [4]
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Función para obtener la ruta por defecto según el puesto_id
function getDefaultRouteForPuesto(puestoId) {
  const defaultRoutes = {
    1: '/admin-dashboard',
    2: '/dashboard-coordinador', 
    3: '/dashboard-operario',
    4: '/tech-dashboard'
  }
  return defaultRoutes[puestoId] || '/login'
}

// Función para verificar si el usuario puede acceder a una ruta
function canAccessRoute(route, userPuestoId) {
  // Rutas públicas siempre accesibles
  if (route.meta.public) return true
  
  // Si no requiere auth, permitir acceso
  if (!route.meta.requiresAuth) return true
  
  // Si requiere auth pero no hay usuario, denegar
  if (!userPuestoId) return false
  
  // Verificar si el puesto está permitido
  if (route.meta.allowedPuestos && Array.isArray(route.meta.allowedPuestos)) {
    return route.meta.allowedPuestos.includes(userPuestoId)
  }
  
  // Si no tiene restricciones específicas, permitir si está autenticado
  return true
}

// Guard de navegación mejorado
router.beforeEach(async (to, from, next) => {
  console.group('🚦 Navigation Guard Enhanced');
  console.log('📍 From:', from.path, '→ To:', to.path);
  console.log('🛣️ Route meta:', to.meta);
  
  // Inicializar el store si no está inicializado
  const authStore = useAuthStore()
  
  // Si no hay datos en el store pero sí en localStorage, inicializar
  if (!authStore.user && localStorage.getItem('isAuthenticated') === 'true') {
    console.log('🔄 Inicializando store desde localStorage...')
    authStore.initializeAuth()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const userPuestoId = authStore.userPuestoId
  const userRole = authStore.userRole
  
  console.log('👤 Usuario autenticado:', isAuthenticated)
  console.log('🏢 Puesto ID:', userPuestoId)
  console.log('👑 Role:', userRole)
  
  // Si es una ruta pública, permitir acceso
  if (to.meta.public) {
    console.log('🟢 Ruta pública - acceso permitido')
    console.groupEnd()
    return next()
  }
  
  // Si no está autenticado y la ruta requiere auth, redirigir a login
  if (!isAuthenticated && to.meta.requiresAuth) {
    console.log('🔴 No autenticado - redirigiendo a login')
    console.groupEnd()
    return next('/login')
  }
  
  // Si está autenticado
  if (isAuthenticated) {
    // Si está yendo a login, redirigir a su dashboard
    if (to.path === '/login' || to.path === '/') {
      const defaultRoute = getDefaultRouteForPuesto(userPuestoId)
      console.log('🔄 Ya autenticado - redirigiendo a dashboard:', defaultRoute)
      console.groupEnd()
      return next(defaultRoute)
    }
    
    // Verificar si puede acceder a la ruta solicitada
    if (!canAccessRoute(to, userPuestoId)) {
      console.log('❌ Acceso denegado - puesto no permitido')
      console.log('🚫 Puesto requerido:', to.meta.allowedPuestos)
      console.log('🧑 Puesto actual:', userPuestoId)
      console.groupEnd()
      return next('/unauthorized')
    }
  }
  
  console.log('✅ Acceso permitido')
  console.groupEnd()
  next()
})

// Guard adicional para validar después de cada navegación
router.afterEach((to, from) => {
  console.log('✨ Navegación completada:', from.path, '→', to.path)
  
  // Actualizar el título de la página según la ruta
  const titles = {
    'admin-dashboard': 'Dashboard - Jefe de Taller',
    'coordinator-dashboard': 'Dashboard - Coordinador',
    'operario-dashboard': 'Dashboard - Operario', 
    'dashboard-tecnico': 'Dashboard - Técnico',
    'login': 'Iniciar Sesión'
  }
  
  document.title = titles[to.name] || 'Sistema de Gestión'
})

export default router