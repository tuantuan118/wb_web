import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/Login.vue'
import MessageBoard from '@/components/MessageBoard.vue'
import Friends from '@/components/Friends.vue'
import { getToken, setRouter } from '@/api/request'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { guestOnly: true }
  },
  {
    path: '/message-board',
    name: 'MessageBoard',
    component: MessageBoard,
    meta: { requiresAuth: true, feed: 'friends' }
  },
  {
    path: '/my-tweets',
    name: 'MyTweets',
    component: MessageBoard,
    meta: { requiresAuth: true, feed: 'mine' }
  },
  {
    path: '/following',
    name: 'Following',
    component: Friends,
    meta: { requiresAuth: true, listType: 'following', relation: 1 }
  },
  {
    path: '/followers',
    name: 'Followers',
    component: Friends,
    meta: { requiresAuth: true, listType: 'followers', relation: 2 }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends,
    meta: { requiresAuth: true, listType: 'mutual', relation: 3 }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

setRouter(router)

router.beforeEach((to, from, next) => {
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.meta.guestOnly && token) {
    next('/message-board')
    return
  }

  next()
})

export default router
