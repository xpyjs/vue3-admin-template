/*
 * @Author: JeremyJone
 * @Date: 2024-02-23 18:34:18
 * @LastEditors: JeremyJone
 * @LastEditTime: 2024-03-20 16:46:39
 * @Description: 处理localStorage的工具函数
 */
import CacheKey from '@/config/cacheKeys';

//#region 正在应用的主题名称
export const getActiveThemeName = () => {
  return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName | null;
};
export const setActiveThemeName = (themeName: ThemeName) => {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName);
};
//#endregion

//#region 正在应用的颜色模式
export const getActiveColorScheme = () => {
  return localStorage.getItem(
    CacheKey.ACTIVE_COLOR_SCHEME
  ) as ColorScheme | null;
};
export const setActiveColorScheme = (colorScheme: ColorScheme) => {
  localStorage.setItem(CacheKey.ACTIVE_COLOR_SCHEME, colorScheme);
};
//#endregion

//#region 正在应用的语言
export const getActiveLangName = () => {
  return localStorage.getItem(CacheKey.ACTIVE_LANG_NAME) as LangName | null;
};
export const setActiveLangName = (langName: LangName) => {
  localStorage.setItem(CacheKey.ACTIVE_LANG_NAME, langName);
};
//#endregion

//#region 正在应用的字体大小
export const getActiveFontSize = () => {
  return parseInt(`${localStorage.getItem(CacheKey.ACTIVE_FONT_SIZE) || 14}`);
};
export const setActiveFontSize = (size: number) => {
  localStorage.setItem(CacheKey.ACTIVE_FONT_SIZE, `${size}`);
};
//#endregion

//#region 添加到 sessionStorage
export const setJSON = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getJSON = (key: string) => {
  const value = sessionStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};
//#endregion
