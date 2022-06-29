import { createApp } from 'vue'
import mitt from 'mitt'
import App from './App.vue'
import store from './store'
import router from './router'

const emitter = mitt()

export default emitter

createApp(App).use(router).use(store, router).mount('#app')