declare interface ISysUser extends BaseDto {
  admin?: boolean;
  avatar?: string;
  delFlag?: string;
  dept?: ISysDept;
  deptId?: number;
  email?: string;
  loginDate?: string;
  loginIp?: string;
  nickName?: string;
  password?: string;
  phonenumber?: string;
  postIds?: any[];
  remark?: string;
  roleId?: any;
  roleIds?: string[];
  roles?: ISysRole[];
  sex?: string;
  status?: '0' | '1';
  userId: number;
  userName: string;
}

declare interface ISysDept extends BaseDto {
  ancestors?: string;
  children?: ISysDept[];
  delFlag?: string;
  deptId: number;
  deptName?: string;
  email?: string;
  leader?: string;
  orderNum?: number;
  parentId?: number;
  parentName?: string;
  phone?: string;
  remark?: string;
  status?: string;
}

declare interface ISysRole extends BaseDto {
  admin?: boolean;
  dataScope?: string;
  delFlag?: string;
  deptCheckStrictly?: boolean;
  deptIds?: any[];
  flag?: boolean;
  menuCheckStrictly?: boolean;
  menuIds?: any[];
  permissions?: string[];
  remark?: string;
  roleId: number;
  roleKey: string;
  roleName: string;
  roleSort: number;
  status: '0' | '1';
}
