import { createRouter, createWebHistory } from 'vue-router'
import StartView from '@/views/StartView.vue'
import GameView from '@/views/GameView.vue'
import EndView from '@/views/EndView.vue'

const routes = [
  {
    path: '/',
    name: 'start',
    component: StartView,
  },
  {
    path: '/game',
    name: 'game',
    component: GameView,
  },
  {
    path: '/end',
    name: 'end',
    component: EndView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
