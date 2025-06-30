import { createRouter, createWebHistory } from 'vue-router'
import HotelsView from '../views/HotelsView.vue'
import RoomTypesView from '../views/RoomTypesView.vue'

const routes = [
  {
    path: '/',
    name: 'Hotels',
    component: HotelsView,
  },
  {
    path: '/room-types',
    name: 'RoomTypes',
    component: RoomTypesView
  }
  // Puedes agregar más rutas aquí
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router