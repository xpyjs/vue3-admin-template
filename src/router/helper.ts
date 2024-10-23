import { isUrl } from '@/utils';

const modules = import.meta.glob('../views/**/*.{vue,tsx}');

export const Layout = () => import('../layout/layout/Layout.vue');
export const LoginLayout = () => import('../layout/layout/LoginLayout.vue');
export const ParentView = () => import('../layout/layout/ParentView.vue');

/**
 * 根据后台路由对象，生成本地可用路由
 *
 * 有时候后台返回的路由对象，不符合本地路由对象的要求，可以在此处进行转换
 */
export const generateLocalRoutes = (
  routes: AppRouteConfig[],
  parentPath = '/'
) => {
  const res: AppRouteConfig[] = [];

  for (const route of routes) {
    const fullPath = resolveRoutePath(parentPath, route.path || '');

    if (route.children) {
      route.children = generateLocalRoutes(route.children, fullPath);
    }

    const comp = loadComponent(route.component);
    // 确保只有找到组件才添加
    if (comp) {
      route.component = comp;

      // 添加 fullPath 地址
      route.fullPath = fullPath;
      // route.path = route.fullPath;

      // 适配本地路由格式
      route.meta = { ...route.meta, hidden: (route as any).hidden ?? false };

      res.push(route);
    }
  }

  return res;
};

function loadComponent(component: any) {
  if (component && typeof component !== 'string') {
    return component;
  }
  if (component === '#' || component === 'Layout') {
    return Layout;
  } else if (component === '##' || component === 'ParentView') {
    return ParentView;
  } else {
    // 普通组件
    const comp = modules[`../views/${component}.vue`];
    if (comp) {
      return comp;
    }

    console.warn(
      `[XPY admin] Cannot find [${component}.vue] file in the views folder. Please check the file path!`
    );
  }
}

const resolveRoutePath = (parentPath: string, path: string) => {
  if (isUrl(path)) return path;
  const childPath = path.startsWith('/') || !path ? path : `/${path}`;
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim();
};
