import { DynamicRoutes, RoutesList } from '@/router/dynamicRouteList';
import { generateLocalRoutes } from '@/router/helper';
import { cloneDeep } from 'lodash-es';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { store } from '../index';

export const useRoutesStore = defineStore('routes', () => {
  /**
   * 所有路由（包括动态的+通用列表）
   */
  const _allRoutes = ref<AppRouteConfig[]>([]);
  /**
   * 是否添加过路由。在添加后设置为 true
   */
  const _isAddRoutes = ref(false);

  return {
    /**
     * 是否添加过路由
     */
    isAddRoutes: computed(() => _isAddRoutes.value),
    setIsAddRoutes(state: boolean) {
      _isAddRoutes.value = state;
    },

    /**
     * 获取所有有效路由列表
     */
    allRoutes: computed<AppRouteConfig[]>(() => _allRoutes.value),

    /**
     * 生成路由列表
     *
     * @param routes
     * @returns
     */
    generateRoutes(routes: AppRouteConfig[]) {
      return new Promise(resolve => {
        let routesMap = generateLocalRoutes(
          cloneDeep([...routes, ...DynamicRoutes])
        );

        // 渲染菜单的所有路由
        _allRoutes.value = routesMap.concat(cloneDeep(RoutesList));

        resolve(true);
      });
    }
  };
});

export const useRoutesStoreOutside = () => {
  return useRoutesStore(store);
};
