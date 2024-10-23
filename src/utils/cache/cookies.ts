/*
 * @Author: JeremyJone
 * @Date: 2024-02-23 18:34:18
 * @LastEditors: JeremyJone
 * @LastEditTime: 2024-03-05 16:33:57
 * @Description: 处理cookie的工具函数
 */

import CacheKey from '@/config/cacheKeys';
import Cookies from 'js-cookie';

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN);
};
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token);
};
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN);
};
