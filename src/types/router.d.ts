import { type RouteComponent } from 'vue-router';

declare global {
  declare interface AppRouteConfig {
    /**
     * 路由名称。通常为路由路径全拼的大驼峰形式
     *
     * @description 如果需要缓存，需要显式的给定名称，否则不会被添加到缓存列表中
     */
    name?: string;
    /**
     * 路由路径。以 / 开头为根路由。不以 / 开头的，会拼接到父级路由路径后
     */
    path?: string;
    /**
     * 路由元信息
     */
    meta?: AppRouteMeta;
    /**
     * 路由组件。可以是组件对象或者组件路径，还可以是特殊字符串，比如：'Layout'、'ParentView'，这些需要特殊处理
     */
    component?: RouteComponent | string;
    /**
     * 子路由列表
     */
    children?: Array<AppRouteConfig>;
    /**
     * 路由完整路径
     */
    fullPath?: string;
    /**
     * 设置路由重定向路径地址。设置为 true 时，跳转到 fullPath，为 false 时，禁用重定向
     */
    redirect?: string | boolean;
    /**
     * 访问路由的菜单权限
     */
    permissions?: Array<string>;
    /**
     * 访问路由的角色权限
     */
    roles?: Array<string>;
  }
}

interface AppRouteMeta {
  /**
   * 有层级时，会展示子项。如果需要一直展示根路由，设为 true
   */
  fixed?: boolean;
  /**
   * 固定在 tag 栏
   */
  affix?: boolean;
  /**
   * 当前路由展示在界面的名称
   */
  title?: string;
  /**
   * 设置路由的图标
   */
  icon?: string;
  /**
   * 不展示在菜单中
   */
  hidden?: boolean;
  /**
   * 设置页面是否被缓存。默认直接缓存，设置为 false 时，不缓存
   */
  cache?: boolean;
  /**
   * 是否展示在面包屑中。默认 true
   */
  breadcrumb?: boolean;
  /**
   * 设置高亮的路由路径
   */
  activeMenu?: string;
  /**
   * 设置是否展示在 tag 中
   */
  noTagsView?: boolean;
  /**
   * 设置路由跳转。即使 hidden 为 true，依然可以跳转
   */
  canTo?: boolean;

  [key: string]: any;
}
