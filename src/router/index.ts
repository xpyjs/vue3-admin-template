import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import nProgress from 'nprogress';
import { getToken } from '@/utils/cache/cookies';
import { useRoutesStoreOutside } from '@/store/modules/routes';
import { RoutesList } from './dynamicRouteList';
import { useUserStoreOutside } from '@/store/modules/user';
import { isRelogin } from '@/utils';
import { setDynamicRoutes } from './setRoutes';
import { setRouteChange } from '@/hooks/useRouteListener';

nProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: RoutesList as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0, behavior: 'smooth' })
});

const whitelist: string[] = ['/login', '/register'];
router.beforeEach((to, from, next) => {
  if (from.path !== to.path) {
    nProgress.start();
  }

  // 登出
  const userStore = useUserStoreOutside();
  if (to.path.includes('/logout')) {
    return userStore
      .logout()
      .then(() => next('/login?redirect=' + encodeURIComponent(from.fullPath)));
  }

  const token = getToken();
  if (!token) {
    // 如果在免登录的白名单中，则直接进入
    if (whitelist.includes(to.path)) return next();
    // 其他没有访问权限的页面将被重定向到登录页面
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // 如果已经登录，并准备进入 Login 页面，则重定向到主页
  if (/\/login[^a-zA-Z]+/.test(to.path)) {
    return next({
      path: (from.query.redirect as string) || '/',
      replace: true
    });
  }

  // 获取过路由列表后，直接进入
  const routesStore = useRoutesStoreOutside();
  if (routesStore.isAddRoutes) {
    return next();
  }

  // 根据权限获取动态路由;
  if (userStore.roles.length === 0) {
    // 将请求置为重新登录
    isRelogin.show = true;
    userStore
      .getInfo()
      .then(() => {
        isRelogin.show = false;
        return setDynamicRoutes();
      })
      .then(() => {
        // F5 刷新页面后，动态路由重新加载，需要重新跳转
        if (to.redirectedFrom) {
          return next({ path: to.redirectedFrom.fullPath, replace: true });
        }

        if (to.path === '/404') {
          return next({ path: '/' });
        }

        // 获取动态路由后，跳转到目标路由
        return next({ ...to, replace: true });
      })
      .catch(async () => {
        // 处理异常，直接退出
        await userStore.logout();
        return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      });
  } else {
    next();
  }
});

router.afterEach(to => {
  setRouteChange(to as AppRouteConfig);
  nProgress.done();
});

export default router;
