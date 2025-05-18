const functionLibRouter = {
  path: '/function-lib',
  name: 'function_lib',
  meta: { title: 'views.functionLib.title', permission: 'APPLICATION:READ' },
  redirect: '/function-lib',
  component: () => import('@/layout/layout-template/AppLayout.vue'),
  children: [
    {
      path: '/function-lib',
      name: 'function-lib-index',
      meta: { title: '工具库主页', activeMenu: '/function-lib' },
      component: () => import('@/views/function-lib/index.vue')
    }
  ]
}

export default functionLibRouter
