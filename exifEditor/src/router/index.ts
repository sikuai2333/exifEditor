import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/modifier'
    },
    {
      path: '/modifier',
      name: 'modifier',
      component: () => import('../views/ModifierView.vue'),
      meta: { title: 'EXIF修改器' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/OnlineSearchView.vue'),
      meta: { title: '在线查询' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '关于' }
    }
  ]
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - EXIF编辑器` : 'EXIF编辑器'
  next()
})

export default router
