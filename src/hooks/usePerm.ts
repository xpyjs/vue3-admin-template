import useUserStore from '@/store/modules/user';

export function usePerm(permList: string[]) {
  function check() {
    return new Promise<boolean>((resolve, reject) => {
      const all_permission = '*:*:*';
      const permissions = useUserStore().permissions;

      if (permList && permList instanceof Array && permList.length > 0) {
        const permissionFlag = permList;

        const has = permissions.some(permission => {
          return (
            all_permission === permission || permissionFlag.includes(permission)
          );
        });

        resolve(has);
      } else {
        reject(`请设置操作权限标签值`);
      }
    });
  }

  return {
    check
  };
}
