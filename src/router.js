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
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings', 
    component: () => import('./components/settings.vue'),
    meta: { 
      requiresAuth: true,
      layout: 'empty'
    }
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/components/VistasAdmin/Reports.vue'),
    meta: { 
      requiresAuth: true,
      layout: 'empty'
    }
  },

  // ================== RUTAS DE ADMIN ==================
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin-dashboard',
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: () => import('@/components/VistasAdmin/Dashboard.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/admin/transacciones',
    name: 'Transacciones',
    component: () => import('@/components/VistasAdmin/Transacciones.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/admin/departments',
    name: 'Departamentos',
    component: () => import('@/components/VistasAdmin/Departamentos.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/components/VistasAdmin/Usuarios.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/components/VistasAdmin/Ordenes.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },

  // ================== RUTAS DE COORDINADOR ==================
  {
    path: '/coordinator',
    name: 'coordinator',
    redirect: '/dashboard-coordinador',
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/dashboard-coordinador',
    name: 'coordinator-dashboard',
    component: () => import('@/components/VistasCoordinador/CoordinadorView.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/control-calidad',
    name: 'control-calidad',
    component: () => import('@/components/VistasCoordinador/ControlCalidad.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/coordinator/planning',
    name: 'coordinator-planning',
    component: () => import('@/components/VistasCoordinador/ProductionPlanning.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/coordinator/orders',
    name: 'coordinator-orders',
    component: () => import('@/components/VistasCoordinador/WorkOrders.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/coordinator/maintenance',
    name: 'coordinator-maintenance',
    component: () => import('@/components/VistasCoordinador/Maintenance.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/coordinator/movimientos',
    name: 'coordinator-movimientos',
    component: () => import('@/components/VistasCoordinador/Historial_de_Movimientos.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },
  {
    path: '/coordinator/planos-tools',
    name: 'coordinator-Planos-herramientas',
    component: () => import('@/components/VistasCoordinador/Planos_Herraminetas.vue'),
    meta: { requiresAuth: true, requiredRoles: ['coordinator'] }
  },

  // ================== RUTAS DE OPERARIO ==================
  {
    path: '/operator',
    name: 'operator',
    redirect: '/dashboard-operario',
    meta: { requiresAuth: true, requiredRoles: ['operator'] }
  },
  {
    path: '/dashboard-operario',
    name: 'operario-dashboard',
    component: () => import('@/components/VistasOperarios/Principal.vue'),
    meta: { requiresAuth: true, requiredRoles: ['operator'] }
  },
  {
    path: '/operario/trabajos',
    name: 'operario-trabajo',
    component: () => import('@/components/VistasOperarios/Trabajos.vue'),
    meta: { requiresAuth: true, requiredRoles: ['operator'] }
  },
  {
    path: '/operario/reportes',
    name: 'operario-reportes',
    component: () => import('@/components/VistasOperarios/Reportes.vue'),
    meta: { requiresAuth: true, requiredRoles: ['operator'] }
  },

  // ================== RUTAS DE TÉCNICO ==================
  {
    path: '/technician',
    name: 'technician',
    redirect: '/tech-dashboard',
    meta: { requiresAuth: true, requiredRoles: ['technician'] }
  },
  {
    path: '/tech-dashboard',
    name: 'dashboard-tecnico',
    component: () => import('@/components/VistasTecnico/DashboardTecnico.vue'),
    meta: { requiresAuth: true, requiredRoles: ['technician'] }
  },
  {
    path: '/tech/schedule',
    name: 'technician-schedule',
    component: () => import('@/components/VistasTecnico/Programacion.vue'),
    meta: { requiresAuth: true, requiredRoles: ['technician'] }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Guardia de navegación unificado
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  console.group('🚦 Navigation Guard');
  console.log('📍 From:', from.path, '→ To:', to.path);
  console.log('👤 User:', {
    id: authStore.user?.id,
    role: authStore.user?.role || authStore.userRole,
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
  if (to.path === '/' && authStore.isAuthenticated) {
    const targetRoute = getDefaultRouteForRole(authStore.user?.role || authStore.userRole);
    console.log(`🔄 Auto-redirecting ${authStore.user?.role || authStore.userRole} to ${targetRoute}`);
    console.groupEnd();
    return next(targetRoute);
  }

  // 4. Control de acceso por roles
  if (to.meta.requiredRoles) {
    const userRole = authStore.user?.role || authStore.userRole;
    const hasRequiredRole = to.meta.requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      console.warn(`⛔ Access denied for ${userRole} to ${to.path}`);
      const defaultRoute = getDefaultRouteForRole(userRole);
      console.log(`🔀 Redirecting to default route: ${defaultRoute}`);
      console.groupEnd();
      return next(defaultRoute);
    }
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
    case 'technician': return '/tech-dashboard';
    default: return '/unauthorized';
  }
}

export default router