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

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.public) {
    return next()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/')
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next('/unauthorized')
  }

  if (to.meta.requiresCoordinator && authStore.user?.role !== 'coordinator') {
    return next('/unauthorized')
  }

  if (to.meta.requiresOperator && authStore.user?.role !== 'operator') {
    return next('/unauthorized')
  }

  next()
})

export default router