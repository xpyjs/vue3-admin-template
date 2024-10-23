import { login, logout, getInfo } from '@/api/login';
import { setToken, removeToken } from '@/utils';
import { defineStore } from 'pinia';
import { store } from '../index';
import { ref } from 'vue';
import { useRoutesStore } from './routes';
import useMessage from '@/hooks/useMessage';
import { setDynamicRoutes } from '@/router/setRoutes';
import { useTagsViewStore } from './tags-view';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<Record<string, any>>({});
  const avatar = ref<string>('');
  const roles = ref<any[]>([]);
  const permissions = ref<string[]>([]);

  const _getInfo = () => {
    return new Promise((resolve, reject) => {
      getInfo()
        .then((res: any) => {
          const user = res.user;
          userInfo.value = user;

          if (res.roles && res.roles.length > 0) {
            // 验证返回的roles是否是一个非空数组
            roles.value = res.roles;
            permissions.value = res.permissions;
          } else {
            roles.value = ['ROLE_DEFAULT'];
          }

          avatar.value = !user.avatar
            ? ''
            : import.meta.env.VITE_APP_BASE_API + user.avatar;
          resolve(res);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  return {
    userInfo,

    avatar,
    setAvatar(a: string) {
      avatar.value = a;
    },

    roles,
    permissions,

    getInfo: _getInfo,

    login: (params: any) => {
      return new Promise((resolve, reject) => {
        login(params)
          .then((res: any) => {
            setToken(res.token);
          })
          .then(_getInfo)
          .then(setDynamicRoutes)
          .then(resolve)
          .catch(error => {
            useMessage(error, 'error', { i18n: false });
            reject(error);
          });
      });
    },

    logout: () => {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            roles.value = [];
            permissions.value = [];
            removeToken();
            useRoutesStore().setIsAddRoutes(false);
            useTagsViewStore().clearVisitedView();
            resolve(1);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  };
});

export const useUserStoreOutside = () => {
  return useUserStore(store);
};

export default useUserStore;
