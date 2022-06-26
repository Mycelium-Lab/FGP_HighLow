import { createRouter, createWebHistory } from 'vue-router'
import CurrentGame from '../components/CurrentGame.vue'
import PastGames from '../components/PastGames.vue'

const routes = [
  {
    path: '/',
    name: 'CurrentGame',
    component: CurrentGame
  },
  {
    path: '/past',
    name: 'PastGames',
    component: PastGames
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'default',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
