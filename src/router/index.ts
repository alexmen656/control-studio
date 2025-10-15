import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/video/:id',
      name: 'video',
      component: () => import('../views/VideoView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/CalendarView.vue'),
    },
    {
      path: '/planning',
      name: 'planning',
      component: () => import('../views/PlanView.vue'),
    },
    {
      path: '/starred',
      name: 'starred',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/trash',
      name: 'trash',
      component: () => import('../views/HomeView.vue'),
    },
  ],
})

export default router
