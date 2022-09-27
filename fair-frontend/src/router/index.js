import { createRouter, createWebHashHistory } from 'vue-router'
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
  mode: 'history',
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  // eslint-disable-next-line
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return { el: `#${to.hash}` }
    } else if (savedPosition) {
        return savedPosition;
    } else {
        return { x: 0, y: 0 }
    }
  },
})

export default router
