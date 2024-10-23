import { request } from '@/utils';

// 获取路由
export const getRouters = () => {
  return request<any, any>({
    url: '/getRouters',
    method: 'get'
  });
};
