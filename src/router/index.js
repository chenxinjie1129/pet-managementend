import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Login = () => import('../views/login/index.vue')
const Dashboard = () => import('../views/dashboard/index.vue')
const NotFound = () => import('../views/404.vue')

// 内容管理
const BannerList = () => import('../views/content/banner/index.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/content',
    name: 'Content',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'banner',
        name: 'BannerList',
        component: BannerList,
        meta: { requiresAuth: true, title: '轮播图管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    // 需要登录但没有token，重定向到登录页
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
