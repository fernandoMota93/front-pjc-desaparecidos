import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'

const routes = [
  {
    meta: {
      title: 'Home',
    },
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/detalhe/:id',
    name: 'detalhe',
    component: () => import('@/views/DetalheView.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router
