/**
 * 请求参数
 *
 * Map«Object»
 */
declare type MapObject = Record<string, any>;

/**
 * dto 基础
 */
declare interface BaseDto {
  /**
   * 创建人
   */
  createBy?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 更新人
   */
  updateBy?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
}
