/*
 * @Author: JeremyJone
 * @Date: 2023-10-27 17:29:10
 * @LastEditors: JeremyJone
 * @LastEditTime: 2024-10-21 11:10:17
 * @Description: 动态路由加载
 */

import router from './index';
import { useRoutesStore } from '../store/modules/routes';
import { getRouters } from '@/api/menu';

export const setDynamicRoutes = async () => {
  const routesStore = useRoutesStore();

  const routes = (await getRouters()).data || [];
  await routesStore.generateRoutes(routes);
  routesStore.allRoutes.forEach(r => {
    if (r.path && !/^https?:\/\//.test(r.path)) {
      router.addRoute(r as any);
    }
  });
  routesStore.setIsAddRoutes(true);
};
