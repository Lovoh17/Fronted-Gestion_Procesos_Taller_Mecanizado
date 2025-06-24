import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  /********************** Rutas Públicas **********************/
  {
    path: '/',
    name: 'login', 
    component: () => import('@/components/LoginForm.vue'),
    meta: { 
      public: true,
      layout: 'empty'
    }
  },
  {
    path: '/herramientas',
    name: 'herramientas',
    component: () => import('@/components/VistasAdmin/Herramientas.vue'),
    meta: { public: true }
  },
  {
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
    meta: {public: true}
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/components/VistasAdmin/Reports.vue'),
    meta: { public: true}
  },
  {
    path: '/settings',
    name: 'settings', 
    component: () => import('./components/settings.vue'),
    meta: { 
      public: true,
      layout: 'empty'
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('./components/Unauthorized .vue'),
    meta: { public: true }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/components/VistasCoordinador/Maintenance.vue'),
    meta: { public: true }
  },
  /********************** Rutas de Administrador **********************/
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: () => import('@/components/VistasAdmin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/transacciones',
    name: 'Transacciones',
    component: () => import('@/components/VistasAdmin/Transacciones.vue'),
    meta: { requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/admin/departments',
    name: 'Departamentos',
    component: () => import('@/components/VistasAdmin/Departamentos.vue'),
    meta: { requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/components/VistasAdmin/Usuarios.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/components/VistasAdmin/Ordenes.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  /********************** Rutas de Coordinador **********************/
  {
    path: '/dashboard-coordinador',
    name: 'coordinator-dashboard',
    component: () => import('@/components/VistasCoordinador/CoordinadorView.vue'),
    meta: { requiresAuth: true, requiresCoordinator: true }
  },
  {
    path: '/control-calidad',
    name: 'control-calidad',
    component: () => import('@/components/VistasCoordinador/ControlCalidad.vue'),
    meta: { requiresAuth: true, requiresCoordinator: true }
  },
  
  {
    path: '/coordinator/planning',
    name: 'coordinator-planning',
    component: () => import('@/components/VistasCoordinador/ProductionPlanning.vue'),
    meta: { requiresAuth: true, requiresCoordinator: true }
  },
  {
    path: '/coordinator/orders',
    name: 'coordinator-orders',
    component: () => import('@/components/VistasCoordinador/WorkOrders.vue'),
    meta: { requiresAuth: true, requiresCoordinator: true }
  },
  {
    path: '/coordinator/maintenance',
    name: 'coordinator-maintenance',
    component: () => import('@/components/VistasCoordinador/Maintenance.vue'),
    meta: { requiresAuth: true, requiresCoordinator: true }
  },
   /********************** Rutas de Operario **********************/
  {
    path: '/dashboard-operario',
    name: 'operario-dashboard',
    component: () => import('@/components/VistasOperarios/Principal.vue'),
    meta: { requiresAuth: true, requiresOperator: true }
  },
  {
    path: '/operario/trabajos',
    name: 'operario-trabajo',
    component: () => import('@/components/VistasOperarios/Trabajos.vue'),
    meta: { requiresAuth: true, requiresOperator: true }
  },
  {
    path: '/operario/reportes',
    name: 'operario-reportes',
    component: () => import('@/components/VistasOperarios/Reportes.vue'),
    meta: { requiresAuth: true, requiresOperator: true }
  },
  /********************** Ruta de Catch-all **********************/
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/components/NotFound.vue'),
    meta: { public: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/components/settings.vue'),
    meta: { public: true }
  },
  
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  console.group('🚦 Navigation Guard');
  console.log('📍 From:', from.path, '→ To:', to.path);
  console.log('👤 User:', {
    id: authStore.user?.id,
    role: authStore.userRole,
    puesto_id: authStore.user?.puesto_id
  });
  console.log('🛣️ Route Requirements:', to.meta);

  // 1. Rutas públicas (acceso libre)
  if (to.meta.public) {
    console.log('ℹ️ Public route - access granted');
    console.groupEnd();
    return next();
  }

  // 2. Verificar autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.warn('⚠️ Unauthenticated - redirecting to login');
    console.groupEnd();
    return next('/login');
  }

  // 3. Redirección automática por rol (solo para ruta raíz)
  if (to.path === '/') {
    const targetRoute = getDefaultRouteForRole(authStore.userRole);
    console.log(`🔄 Auto-redirecting ${authStore.userRole} to ${targetRoute}`);
    console.groupEnd();
    return next(targetRoute);
  }

  // 4. Control estricto de acceso por roles
  const hasAccess = checkRoleAccess(authStore.userRole, to.meta);
  
  if (!hasAccess) {
    console.warn(`⛔ Access denied for ${authStore.userRole} to ${to.path}`);
    const defaultRoute = getDefaultRouteForRole(authStore.userRole);
    console.log(`🔀 Redirecting to default route: ${defaultRoute}`);
    console.groupEnd();
    return next(defaultRoute);
  }

  console.log('🟢 Access granted');
  console.groupEnd();
  next();
});

// Funciones auxiliares
function getDefaultRouteForRole(role) {
  switch(role) {
    case 'admin': return '/admin-dashboard';
    case 'coordinator': return '/dashboard-coordinador';
    case 'operator': return '/dashboard-operario';
    default: return '/unauthorized';
  }
}

function checkRoleAccess(userRole, routeMeta) {
  // Admin solo debe acceder a rutas de admin, no a rutas específicas de otros roles
  if (userRole === 'admin') {
    return !routeMeta.requiresOperator && !routeMeta.requiresCoordinator;
  }
  
  // Coordinator no puede acceder a rutas de admin u operator
  if (userRole === 'coordinator') {
    return routeMeta.requiresCoordinator && !routeMeta.requiresAdmin && !routeMeta.requiresOperator;
  }
  
  // Operator solo puede acceder a rutas de operator
  if (userRole === 'operator') {
    return routeMeta.requiresOperator && !routeMeta.requiresAdmin && !routeMeta.requiresCoordinator;
  }
  
  return false;
}

export default router