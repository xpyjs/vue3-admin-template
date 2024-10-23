import { Layout } from './helper';

/**
 * 默认通用路由列表。基础路由直接加载到默认路由中，不需要配置
 *
 * @description 基础配置，通常不需要单独配置
 */
export const RoutesList: Array<AppRouteConfig> = [
  {
    path: '/redirect',
    name: 'Redirect',
    component: Layout,
    meta: { hidden: true, noTagsView: true },
    children: [
      {
        path: ':path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true, noTagsView: true }
  },
  {
    path: '/logout',
    name: 'Logout',
    meta: { hidden: true, noTagsView: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { hidden: true, noTagsView: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { hidden: true, noTagsView: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true, noTagsView: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: 'index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/home/index.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    meta: { hidden: true },
    redirect: 'profile',
    children: [
      {
        path: '/user/profile',
        component: () => import('@/views/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noTagsView: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'NoMatch',
    meta: {
      hidden: true,
      breadcrumb: false
    }
  }
];

/**
 * 动态路由，基于用户权限动态去加载。它会拼接在后台返回的路由列表后面。
 *
 * @description 该路由列表基于项目实际情况加载
 */
export const DynamicRoutes: Array<AppRouteConfig> = [
  // {
  //   path: '/system/user-auth',
  //   component: Layout,
  //   meta: { hidden: true },
  //   permissions: ['system:user:edit'],
  //   children: [
  //     {
  //       path: 'role/:userId(\\d+)',
  //       component: () => import('@/views/system/user/authRole.vue'),
  //       name: 'SystemUserAuthRole',
  //       meta: { title: '分配角色', activeMenu: '/system/user' }
  //     }
  //   ]
  // },
  // {
  //   path: '/system/role-auth',
  //   component: Layout,
  //   meta: { hidden: true },
  //   permissions: ['system:role:edit'],
  //   children: [
  //     {
  //       path: 'user/:roleId(\\d+)',
  //       component: () => import('@/views/system/role/authUser.vue'),
  //       name: 'SystemRoleAuthUser',
  //       meta: { title: '分配用户', activeMenu: '/system/role' }
  //     }
  //   ]
  // },
  // {
  //   path: '/system/dict-data',
  //   component: Layout,
  //   meta: { hidden: true },
  //   permissions: ['system:dict:list'],
  //   children: [
  //     {
  //       path: 'index/:dictId(\\d+)',
  //       component: () => import('@/views/system/dict/data.vue'),
  //       name: 'SystemDictDataIndex',
  //       meta: { title: '字典数据', activeMenu: '/system/dict' }
  //     }
  //   ]
  // },
  // {
  //   path: '/monitor/job-log',
  //   component: Layout,
  //   meta: { hidden: true },
  //   permissions: ['monitor:job:list'],
  //   children: [
  //     {
  //       path: 'index/:jobId(\\d+)',
  //       component: () => import('@/views/monitor/job/log.vue'),
  //       name: 'MonitorJobLogIndex',
  //       meta: { title: '调度日志', activeMenu: '/monitor/job' }
  //     }
  //   ]
  // }
];
