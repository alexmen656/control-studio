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
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/shared',
      name: 'shared',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/recent',
      name: 'recent',
      component: () => import('../views/HomeView.vue'),
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
