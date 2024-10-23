/*
 * @Author: JeremyJone
 * @Date: 2024-02-24 12:57:38
 * @LastEditors: JeremyJone
 * @LastEditTime: 2024-10-21 10:21:05
 * @Description: 路由监听器
 * @Thanks: https://gitee.com/un-pany/v3-admin-vite/blob/main/src/hooks/useRouteListener.ts#
 */

import { onBeforeUnmount } from 'vue';
import mitt, { type Handler } from 'mitt';

/** 回调函数的类型 */
type Callback = (route: AppRouteConfig) => void;

const emitter = mitt();
const key = Symbol('ROUTE_CHANGE');
let latestRoute: AppRouteConfig;

/** 设置最新的路由信息，触发路由变化事件 */
export const setRouteChange = (to: AppRouteConfig) => {
  // 触发事件
  emitter.emit(key, to);
  // 缓存最新的路由信息
  latestRoute = to;
};

/** 单独监听路由会浪费渲染性能，使用发布订阅模式去进行分发管理 */
export function useRouteListener() {
  /** 回调函数集合 */
  const callbackList: Callback[] = [];

  /** 监听路由变化（可以选择立即执行） */
  const listenerRouteChange = (callback: Callback, immediate = false) => {
    // 缓存回调函数
    callbackList.push(callback);
    // 监听事件
    emitter.on(key, callback as Handler);
    // 可以选择立即执行一次回调函数
    immediate && latestRoute && callback(latestRoute);
  };

  /** 移除路由变化事件监听器 */
  const removeRouteListener = (callback: Callback) => {
    emitter.off(key, callback as Handler);
  };

  /** 组件销毁前移除监听器 */
  onBeforeUnmount(() => {
    for (let i = 0; i < callbackList.length; i++) {
      removeRouteListener(callbackList[i]);
    }
  });

  return { listenerRouteChange, removeRouteListener };
}
