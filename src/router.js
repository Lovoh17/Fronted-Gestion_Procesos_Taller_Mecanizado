import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('@/components/Welcome.vue')
  },
  {
    path: '/login',
    name: 'login', 
    component: () => import('@/components/LoginForm.vue'),
    meta: {
      layout: 'empty'
    }
  },
  {
    path: '/Dashboard_admin',
    name: 'Dashboard_admin',
    component: () => import('@/components/VistasAdmin/Dashboard.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/components/VistasAdmin/adminView.vue')
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/components/VistasAdmin/ProductInventory.vue')
  },
  {
    path: '/workshop',
    name: 'workshop',
    component: () => import('@/components/VistasAdmin/Reports.vue')
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: () => import('@/components/VistasAdmin/usuarios.vue')
  },
  {
    path: '/ordenes-trabajos',
    name: 'ordenes-trabajos',
    component: () => import('@/components/VistasAdmin/Ordenes.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router