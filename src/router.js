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
    meta: { public: true }
  },
  {
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
    meta: { public: true }
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
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/components/VistasAdmin/Reports.vue'),
    meta: { 
      public: true,
      layout: 'empty'
    }
  },

  // ================== RUTAS DE ADMIN ==================
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin-dashboard',
    meta: { public: true }
  },
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: () => import('@/components/VistasAdmin/Dashboard.vue'),
    meta: { public: true }
  },
  ,
  {
    path: '/rrhh',
    name: 'rrhh',
    component: () => import('@/components/VistasAdmin/RRHH.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/transacciones',
    name: 'Transacciones',
    component: () => import('@/components/VistasAdmin/Transacciones.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/departments',
    name: 'Departamentos',
    component: () => import('@/components/VistasAdmin/Departamentos.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/components/VistasAdmin/Usuarios.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/components/VistasAdmin/Ordenes.vue'),
    meta: { public: true }
  },

  // ================== RUTAS DE COORDINADOR ==================
  {
    path: '/coordinator',
    name: 'coordinator',
    redirect: '/dashboard-coordinador',
    meta: { public: true }
  },
  {
    path: '/dashboard-coordinador',
    name: 'coordinator-dashboard',
    component: () => import('@/components/VistasCoordinador/CoordinadorView.vue'),
    meta: { public: true }
  },
  {
    path: '/pedidos/nuevo',
    name: 'new-order',
    component: () => import('./components/VistasCoordinador/WorkOrderModal.vue'),
    meta: { public: true }
  },
  {
    path: '/control-calidad',
    name: 'control-calidad',
    component: () => import('@/components/VistasCoordinador/ControlCalidad.vue'),
    meta: { public: true }
  },
  {
    path: '/coordinator/planning',
    name: 'coordinator-planning',
    component: () => import('@/components/VistasCoordinador/ProductionPlanning.vue'),
    meta: { public: true }
  },
  {
    path: '/coordinator/orders',
    name: 'coordinator-orders',
    component: () => import('@/components/VistasCoordinador/WorkOrders.vue'),
    meta: { public: true }
  },
  {
    path: '/coordinator/maintenance',
    name: 'coordinator-maintenance',
    component: () => import('@/components/VistasCoordinador/Maintenance.vue'),
    meta: { public: true }
  },
  {
    path: '/coordinator/movimientos',
    name: 'coordinator-movimientos',
    component: () => import('@/components/VistasCoordinador/Historial_de_Movimientos.vue'),
    meta: { public: true }
  },
  {
    path: '/coordinator/planos-tools',
    name: 'coordinator-Planos-herramientas',
    component: () => import('@/components/VistasCoordinador/Planos_Herraminetas.vue'),
    meta: { public: true }
  },

  // ================== RUTAS DE OPERARIO ==================
  {
    path: '/operator',
    name: 'operator',
    redirect: '/dashboard-operario',
    meta: { public: true }
  },
  {
    path: '/dashboard-operario',
    name: 'operario-dashboard',
    component: () => import('@/components/VistasOperarios/Principal.vue'),
    meta: { public: true }
  },
  {
    path: '/operario/trabajos',
    name: 'operario-trabajo',
    component: () => import('@/components/VistasOperarios/Trabajos.vue'),
    meta: { public: true }
  },
  {
    path: '/operario/reportes',
    name: 'operario-reportes',
    component: () => import('@/components/VistasOperarios/Reportes.vue'),
    meta: { public: true }
  },

  // ================== RUTAS DE TÉCNICO ==================
  {
    path: '/technician',
    name: 'technician',
    redirect: '/tech-dashboard',
    meta: { public: true }
  },
  {
    path: '/tech-dashboard',
    name: 'dashboard-tecnico',
    component: () => import('@/components/VistasTecnico/DashboardTecnico.vue'),
    meta: { public: true }
  },
  {
    path: '/tech/schedule',
    name: 'technician-schedule',
    component: () => import('@/components/VistasTecnico/Programacion.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Guardia de navegación simplificado ya que todas las rutas son públicas
router.beforeEach((to, from, next) => {
  console.group('🚦 Navigation Guard');
  console.log('📍 From:', from.path, '→ To:', to.path);
  console.log('🛣️ Route:', to.meta);
  console.log('🟢 Access granted (all routes are public)');
  console.groupEnd();
  next();
})

export default router