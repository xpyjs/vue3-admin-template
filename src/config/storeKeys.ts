import { SystemSymbolId } from './symbolId';
const _storeKeys = {
  userInfo: 'x_user_info',
  roleRouters: 'x_role_routers',
  AllUsers: 'x_sys_users',
  AllApis: 'x_sys_apis',
  AllRoles: 'x_sys_roles',
  AllDepts: 'x_sys_depts'
} as const;

export const storeKeys = Object.fromEntries(
  Object.entries(_storeKeys).map(([k, v]) => [k, `${SystemSymbolId}_${v}`])
) as Record<keyof typeof _storeKeys, string>;
