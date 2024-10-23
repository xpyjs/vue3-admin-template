declare interface IMenu {
  /**
   * 菜单名称
   */
  label: string;
  /**
   * 菜单图标
   */
  icon?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 分割线
   */
  divided?: boolean;
  /**
   * 回调事件
   */
  command?: (item: IMenu) => void;
}
