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
    path: '/admin',
    name: 'admin',
    component: () => import('@/components/VistasAdmin/adminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/components/VistasAdmin/Reports.vue'),
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
    path: '/inventory',
    name: 'admin-inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue'),
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// Guardia de navegación modificada
router.beforeEach(async (to, from, next) => {
  // Importación dinámica del store
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  if (to.meta.public) {
    return next()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return next('/')
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next('/unauthorized')
  }

  if (to.meta.requiresCoordinator && authStore.user?.role !== 'coordinator') {
    return next('/unauthorized')
  }

  next()
})

export default router