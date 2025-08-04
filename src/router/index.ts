import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/api'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: {
        requiresGuest: true, // Solo accesible cuando no está autenticado
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'admin',
      },
    },
    {
      path: '/admin/teams',
      name: 'admin-teams',
      component: () => import('../views/AdminTeams.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'admin',
      },
    },
    {
      path: '/admin/tournaments',
      name: 'admin-tournaments',
      component: () => import('../views/AdminTournaments.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'admin',
      },
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: () => import('../views/AdminCategories.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'admin',
      },
    },
    // Catch-all route - debe ir al final
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const userRole = authService.getUserRole()

  // Si la ruta requiere estar autenticado
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      next('/login')
      return
    }

    // Verificar rol específico si se requiere
    if (to.meta.requiredRole && userRole !== to.meta.requiredRole) {
      // Redirigir a home si no tiene el rol requerido
      next('/')
      return
    }
  }

  // Si la ruta requiere ser invitado (no autenticado)
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirigir a home si ya está autenticado
    next('/')
    return
  }

  next()
})

export default router
