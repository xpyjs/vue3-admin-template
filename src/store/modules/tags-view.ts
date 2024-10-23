import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import store from '../index';

type TagView = Partial<AppRouteConfig>;

export const useTagsViewStore = defineStore('tags-view', () => {
  /**
   * 已访问的视图
   *
   * @description 已访问的视图：是指用户已经访问过的页面，包括但不限于已缓存的页面视图。所有已访问的页签保留在 tag-views 中
   */
  const visitedViews = ref<TagView[]>([]);
  /**
   * 缓存的视图
   *
   * @description 只有访问过，且允许被缓存的页面视图才会添加到这里
   *
   * @requires 需要配合页面视图组件的 name 属性。视图名称与路由路径保持一致
   */
  const cachedViews = ref<string[]>([]);

  /**
   * 添加缓存视图
   */
  function addCachedView(view: TagView) {
    if (
      !view.name ||
      view.meta?.cache === false ||
      cachedViews.value.some(item => item === view.name)
    )
      return;
    cachedViews.value.push(view.name);
  }

  /**
   * 删除缓存视图
   */
  function removeCachedView(view: TagView) {
    const index = cachedViews.value.findIndex(item => item === view.name);
    if (index !== -1) {
      cachedViews.value.splice(index, 1);
    }
  }

  return {
    visitedViews: computed<TagView[]>(() => visitedViews.value),
    cachedViews,

    /**
     * 添加已访问的视图
     */
    addVisitedView(view: TagView) {
      // 相同的视图不重复添加
      const index = visitedViews.value.findIndex(
        item => item.path === view.path
      );
      if (index !== -1) {
        // 更新已访问的视图
        visitedViews.value[index] = view;
        return;
      }

      view.name &&
        view.meta?.title &&
        !view.meta?.noTagsView &&
        visitedViews.value.push(view);
      // 添加缓存视图
      addCachedView(view);
    },

    /**
     * 删除已访问的视图
     */
    removeVisitedView(view: TagView) {
      const index = visitedViews.value.findIndex(
        item => item.name === view.name
      );
      if (index !== -1) {
        visitedViews.value.splice(index, 1);
      }

      // 删除缓存视图
      removeCachedView(view);
    },

    /**
     * 删除当前视图的缓存
     */
    removeCachedView,

    /**
     * 删除其他已访问的视图
     */
    removeOtherVisitedView(view: TagView) {
      visitedViews.value = visitedViews.value.filter(
        item => item.meta?.affix || item.path === view.path
      );
      cachedViews.value = [];
      visitedViews.value.forEach(addCachedView);
    },

    /**
     * 删除所有已访问的视图
     */
    removeAllVisitedView() {
      visitedViews.value = visitedViews.value.filter(item => item.meta?.affix);
      cachedViews.value = [];
    },

    /**
     * 清空所有视图，包括固定的内容
     */
    clearVisitedView() {
      visitedViews.value = [];
      cachedViews.value = [];
    }
  };
});

export const useTagsViewStoreOutside = () => {
  return useTagsViewStore(store);
};
