import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Electron 中使用 hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/settings',
      component: () => import('./views/SettingsView.vue')
    }
  ]
})

export default router
