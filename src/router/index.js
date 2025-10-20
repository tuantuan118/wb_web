import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/Login.vue'
import MessageBoard from '@/components/MessageBoard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/message-board',
    name: 'MessageBoard',
    component: MessageBoard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 