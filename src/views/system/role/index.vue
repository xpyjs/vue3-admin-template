<template>
  <div class="box-border p-16px">
    <el-form :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="onSearch"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          style="width: 240px"
          @keyup.enter.native="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <XButton primary @click="onSearch">搜索</XButton>
        <XButton @click="resetQuery">重置</XButton>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <XButton
          primary
          plain
          @click="handleAdd"
          v-permission="['system:role:add']"
          >新增</XButton
        >
      </el-col>
      <el-col :span="1.5">
        <XButton
          type="success"
          plain
          :disabled="selectedList.length !== 1"
          @click="handleUpdate"
          v-permission="['system:role:edit']"
          >修改</XButton
        >
      </el-col>
      <el-col :span="1.5">
        <XButton
          type="danger"
          plain
          :disabled="selectedList.length === 0"
          @click="() => handleDelete()"
          v-permission="['system:role:remove']"
          >删除</XButton
        >
      </el-col>
    </el-row>

    <XTable
      v-loading="loading"
      :data="dataList"
      :headers="[
        { prop: 'roleId', label: '角色编号' },
        { prop: 'roleName', label: '角色名称', showOverflowTooltip: true },
        { prop: 'roleKey', label: '权限字符', showOverflowTooltip: true },
        { prop: 'roleSort', label: '显示顺序', showOverflowTooltip: true },
        { prop: 'status', label: '启用状态' },
        {
          prop: 'createTime',
          label: '创建时间',
          timeFormatter: true
        },
        { prop: 'operation', width: 200 }
      ]"
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :pagination="{
        total: totalCount
      }"
      use-selection
      v-model:selected="selectedList"
    >
      <template v-slot:status="{ scope }">
        <el-switch
          :modelValue="scope.row.status"
          active-value="0"
          inactive-value="1"
          @click="handleStatusChange(scope.row)"
        />
      </template>

      <template v-slot:operation="{ scope }">
        <XButton
          v-if="scope.row.roleId !== 1"
          link
          type="primary"
          @click="handleUpdate(scope.row)"
          v-permission="['system:role:edit']"
          >修改</XButton
        >
        <XButton
          v-if="scope.row.roleId !== 1"
          link
          type="danger"
          @click="handleDelete(scope.row)"
          v-permission="['system:role:remove']"
          >删除</XButton
        >
        <el-dropdown
          v-if="scope.row.roleId !== 1"
          trigger="click"
          @command="(command: string) => handleCommand(command, scope.row)"
          v-permission="['system:role:edit']"
        >
          <XButton link type="info" class="ml-12px">更多</XButton>
          <template v-slot:dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                command="handleDataScope"
                :icon="useIcon({ name: 'carbon:data-view-alt' })"
                v-permission="['system:role:edit']"
                >数据权限</el-dropdown-item
              >
              <el-dropdown-item
                command="handleAuthUser"
                :icon="useIcon({ name: 'tabler:user-cog' })"
                v-permission="['system:role:edit']"
                >分配用户</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </XTable>

    <!-- 添加或修改角色配置对话框 -->
    <XDialog :title="editDialogTitle" v-model="showEditDialog" width="500">
      <el-form
        ref="editDialogFormRef"
        :model="editData"
        :rules="{
          roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ],
          roleKey: [
            { required: true, message: '权限字符不能为空', trigger: 'blur' }
          ],
          roleSort: [
            { required: true, message: '角色顺序不能为空', trigger: 'blur' }
          ]
        }"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template v-slot:label>
            <el-tooltip
              content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
              placement="top"
              show-after="200"
            >
              <XIcon
                name="mingcute:question-line"
                class="self-center cursor-help"
              />
            </el-tooltip>
            <span>权限字符</span>
          </template>
          <el-input v-model="editData.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number
            v-model="editData.roleSort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editData.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox
            v-model="menuExpand"
            @change="handleCheckedTreeExpand($event, 'menu')"
            >展开/折叠</el-checkbox
          >
          <el-checkbox
            v-model="menuNodeAll"
            @change="handleCheckedTreeNodeAll($event, 'menu')"
            >全选/全不选</el-checkbox
          >
          <el-checkbox
            v-model="editData.menuCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'menu')"
            >父子联动</el-checkbox
          >
          <el-scrollbar :max-height="350" class="w-full">
            <el-tree
              :data="menuOptions"
              show-checkbox
              ref="menuRef"
              node-key="id"
              :check-strictly="!editData.menuCheckStrictly"
              empty-text="加载中，请稍候"
              :props="{
                children: 'children',
                label: 'label'
              }"
            ></el-tree>
          </el-scrollbar>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editData.remark"
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <XButton primary @click="onEditSubmit">确 定</XButton>
        <XButton @click="onEditCancel">取 消</XButton>
      </template>
    </XDialog>

    <!-- 分配角色数据权限对话框 -->
    <XDialog title="分配数据权限" v-model="showDataScopeDialog" width="500">
      <el-form :model="editData" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editData.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="editData.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="editData.dataScope" @change="changeDataScope">
            <el-option
              v-for="item in [
                { value: '1', label: '全部数据权限' },
                { value: '2', label: '自定数据权限' },
                { value: '3', label: '本部门数据权限' },
                { value: '4', label: '本部门及以下数据权限' },
                { value: '5', label: '仅本人数据权限' }
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="editData.dataScope === '2'">
          <el-checkbox
            v-model="deptExpand"
            @change="handleCheckedTreeExpand($event, 'dept')"
            >展开/折叠</el-checkbox
          >
          <el-checkbox
            v-model="deptNodeAll"
            @change="handleCheckedTreeNodeAll($event, 'dept')"
            >全选/全不选</el-checkbox
          >
          <el-checkbox
            v-model="editData.deptCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'dept')"
            >父子联动</el-checkbox
          >
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="deptRef"
            node-key="id"
            :check-strictly="!editData.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{
              children: 'children',
              label: 'label'
            }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <XButton primary @click="onDataScopeSubmit">确 定</XButton>
        <XButton @click="onDataScopeCancel">取 消</XButton>
      </template>
    </XDialog>

    <!-- 分配用户对话框 -->
    <XDialog title="分配用户" v-model="showAuthRoleDialog" width="1000">
      <el-form :model="userQueryParams" :inline="true" label-width="70px">
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="userQueryParams.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="userOnSearch"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="userQueryParams.phonenumber"
            placeholder="请输入手机号码"
            clearable
            style="width: 240px"
            @keyup.enter.native="userOnSearch"
          />
        </el-form-item>
        <el-form-item>
          <XButton primary @click="userOnSearch">搜索</XButton>
          <XButton @click="resetUserQuery">重置</XButton>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <XButton
            primary
            plain
            @click="handleAddUser"
            v-permission="['system:role:add']"
            >添加用户</XButton
          >
        </el-col>
        <el-col :span="1.5">
          <XButton
            type="danger"
            plain
            :disabled="selectedUserList.length === 0"
            @click="() => handleCancelAuthUser()"
            v-permission="['system:role:remove']"
            >批量取消授权</XButton
          >
        </el-col>
      </el-row>

      <XTable
        v-loading="userLoading"
        :data="userData"
        :headers="[
          { prop: 'userName', label: '用户名称' },
          { prop: 'nickName', label: '用户昵称' },
          { prop: 'email', label: '邮箱' },
          { prop: 'phonenumber', label: '电话' },
          { prop: 'status', label: '状态' },
          {
            prop: 'createTime',
            label: '创建时间',
            width: 150,
            timeFormatter: true
          },
          { prop: 'operation', width: 100 }
        ]"
        v-model:currentPage="userCurrentPage"
        v-model:pageSize="userPageSize"
        :pagination="{
          total: userTotalCount
        }"
        use-selection
        v-model:selected="selectedUserList"
      >
        <template v-slot:status="{ scope }">
          <el-switch
            :modelValue="scope.row.status"
            active-value="0"
            inactive-value="1"
          />
        </template>

        <template v-slot:operation="{ scope }">
          <XButton
            link
            type="danger"
            @click="handleCancelAuthUser(scope.row)"
            v-permission="['system:role:remove']"
            >取消权限</XButton
          >
        </template>
      </XTable>
    </XDialog>

    <!-- 添加用户 -->
    <XDialog title="添加用户" v-model="showAddUserDialog" width="1000">
      <el-form :model="addUserQueryParams" :inline="true" label-width="70px">
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="addUserQueryParams.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="addUserOnSearch"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="addUserQueryParams.phonenumber"
            placeholder="请输入手机号码"
            clearable
            style="width: 240px"
            @keyup.enter.native="addUserOnSearch"
          />
        </el-form-item>
        <el-form-item>
          <XButton primary @click="addUserOnSearch">搜索</XButton>
          <XButton @click="resetAddUserQuery">重置</XButton>
        </el-form-item>
      </el-form>

      <XTable
        v-loading="addUserLoading"
        :data="addUserData"
        :headers="[
          { prop: 'userName', label: '用户名称' },
          { prop: 'nickName', label: '用户昵称' },
          { prop: 'email', label: '邮箱' },
          { prop: 'phonenumber', label: '电话' },
          { prop: 'status', label: '状态' },
          {
            prop: 'createTime',
            label: '创建时间',
            width: 150,
            timeFormatter: true
          }
        ]"
        v-model:currentPage="addUserCurrentPage"
        v-model:pageSize="addUserPageSize"
        :pagination="{
          total: addUserTotalCount
        }"
        use-selection
        v-model:selected="selectedAddUserList"
      >
        <template v-slot:status="{ scope }">
          <el-switch
            :modelValue="scope.row.status"
            active-value="0"
            inactive-value="1"
          />
        </template>
      </XTable>

      <template v-slot:footer>
        <XButton primary @click="onAddUserSubmit">确 定</XButton>
        <XButton @click="onAddUserCancel">关 闭</XButton>
      </template>
    </XDialog>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Role' });
import {
  listRole,
  getRole,
  delRole,
  addRole,
  updateRole,
  dataScope,
  changeRoleStatus,
  deptTreeSelect,
  allocatedUserList,
  authUserCancelAll,
  unallocatedUserList,
  authUserSelectAll
} from '@/api/system/role';
import XDialog from '@/components/dialog';
import XIcon, { useIcon } from '@/components/icon';
import XInput from '@/components/input';
import XTable from '@/components/table';
import { getToken } from '@/utils/cache/cookies';
import { useTable } from '@xpyjs/vue-ease';
import { ElForm, ElTree, FormRules, ElMessageBox } from 'element-plus';
import { nextTick, reactive, ref, watch } from 'vue';
import { useDict } from '@/hooks/useDict';
import XButton from '@/components/button';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';
import {
  treeselect as getMenuTree,
  roleMenuTreeselect
} from '@/api/system/menu';

const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable');

const DEFAULT_PARAMS = () =>
  ({}) as {
    roleName?: string;
    roleKey?: string;
    status?: string;
  };
const queryParams = ref(DEFAULT_PARAMS());
const dateRange = ref([]);

const {
  dataList,
  totalCount,
  pageSize,
  currentPage,
  loading,
  getData,
  onSearch
} = useTable<ISysRole>({
  api: (): any =>
    listRole({
      ...queryParams.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      params: {
        beginTime: dateRange.value[0],
        endTime: dateRange.value[1]
      }
    }).then(res => {
      return {
        list: res.rows || [],
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10
});
const selectedList = ref<ISysRole[]>([]);

const resetQuery = () => {
  queryParams.value = DEFAULT_PARAMS();
  dateRange.value = [];
  onSearch();
};

function handleStatusChange(row: ISysRole) {
  const status = row.status === '0' ? '1' : '0';
  changeRoleStatus(row.roleId, status)
    .then((res: any) => {
      useMessage('messages.update_success');
      row.status = status;
    })
    .catch(() => {
      row.status = status === '0' ? '1' : '0';
    });
}

function handleDelete(row?: ISysRole) {
  const user = row ? [row] : selectedList.value;
  user.length > 0 &&
    useDeleteMessageBox(user.map(u => u.roleName).join(','), (res, rej) => {
      delRole(user.map(u => u.roleId)).then(() => {
        getData();
        res(1);
      });
    });
}
function handleCommand(command: string, row: ISysRole) {
  switch (command) {
    case 'handleDataScope':
      handleDataScope(row);
      break;
    case 'handleAuthUser':
      handleAuthUser(row);
      break;
    default:
      break;
  }
}

// 修改数据权限
const DEFAULT_ROLE_DATA = () =>
  ({
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true
  }) as Partial<ISysRole>;
const editData = ref<Partial<ISysRole>>(DEFAULT_ROLE_DATA());
const deptOptions = ref<any[]>([]);
const deptRef = ref<InstanceType<typeof ElTree>>();
const editDialogTitle = ref('');
const showEditDialog = ref(false);
const editDialogFormRef = ref<InstanceType<typeof ElForm>>();
const menuOptions = ref<any[]>([]);
const menuRef = ref<InstanceType<typeof ElTree>>();
const menuExpand = ref(false);
const menuNodeAll = ref(false);
function handleAdd() {
  getMenuTree().then(res => {
    menuOptions.value = res.data;
  });
  reset();
  showEditDialog.value = true;
  editDialogTitle.value = '添加角色';
}
function handleUpdate(row?: ISysRole) {
  const id = row?.roleId || selectedList.value[0]?.roleId;
  id !== undefined &&
    getRole(id).then(response => {
      editData.value = response.data;
      editDialogTitle.value = '修改角色';
      showEditDialog.value = true;
      nextTick(() => {
        roleMenuTreeselect(id)
          .then((res: any) => {
            menuOptions.value = res.menus;
            return res.checkedKeys;
          })
          .then(res => {
            res?.forEach((v: any) => {
              menuRef.value?.setChecked(v, true, false);
            });
          });
      });
    });
}
function getAllCheckedKeys(type: string) {
  const ref = type === 'menu' ? menuRef.value : deptRef.value;
  // 获取所有选中的节点
  const checkedKeys = ref?.getCheckedKeys() || [];
  // 获取所有半选中的节点
  const halfCheckedKeys = ref?.getHalfCheckedKeys() || [];

  // 合并选中的节点和半选中的节点
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

function onEditSubmit() {
  editDialogFormRef.value?.validate(async valid => {
    if (valid) {
      if (editData.value.roleId !== undefined) {
        editData.value.menuIds = getAllCheckedKeys('menu');
        await updateRole(editData.value);
        useMessage('messages.update_success');
      } else {
        editData.value.menuIds = getAllCheckedKeys('menu');
        await addRole(editData.value);
        useMessage('messages.create_success');
      }
      showEditDialog.value = false;
      getData();
    }
  });
}
function onEditCancel() {
  showEditDialog.value = false;
  reset();
}

function reset() {
  editData.value = DEFAULT_ROLE_DATA();
  editDialogFormRef.value?.resetFields();
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = false;
  deptNodeAll.value = false;
  if (menuRef.value) {
    menuRef.value.setCheckedKeys([]);
  }
  if (deptRef.value) {
    deptRef.value.setCheckedKeys([]);
  }
}

// 数据权限
function handleDataScope(row: ISysRole) {
  reset();
  getRole(row.roleId).then(response => {
    editData.value = response.data;
    showDataScopeDialog.value = true;
    nextTick(() => {
      deptTreeSelect(row.roleId)
        .then((res: any) => {
          deptOptions.value = res.depts;
          return res;
        })
        .then(res => {
          deptRef.value?.setCheckedKeys(res.checkedKeys);
        });
    });
  });
}

const showDataScopeDialog = ref(false);
const deptNodeAll = ref(false);
const deptExpand = ref(true);
function changeDataScope(val: string) {
  if (val !== '2') {
    deptRef.value?.setCheckedKeys([]);
  }
}
function onDataScopeSubmit() {
  if (editData.value.roleId === undefined) return;

  editData.value.deptIds = getAllCheckedKeys('dept');
  dataScope(editData.value)
    .then(() => {
      useMessage('messages.update_success');
      getData();
    })
    .finally(() => {
      showDataScopeDialog.value = false;
    });
}
function onDataScopeCancel() {
  showDataScopeDialog.value = false;
  reset();
}

// 分配用户
const showAuthRoleDialog = ref(false);
const DEFAULT_USER_PARAMS = () =>
  ({}) as { userName?: string; roleId?: number; phonenumber?: string };
const userQueryParams = ref(DEFAULT_USER_PARAMS());
function handleAuthUser(row: ISysRole) {
  showAuthRoleDialog.value = true;
  editData.value = row;
  userQueryParams.value = { roleId: editData.value?.roleId };
  userGetData();
}

const {
  dataList: userData,
  totalCount: userTotalCount,
  pageSize: userPageSize,
  currentPage: userCurrentPage,
  loading: userLoading,
  getData: userGetData,
  onSearch: userOnSearch
} = useTable<ISysRole>({
  api: (): any =>
    allocatedUserList({
      ...userQueryParams.value,
      pageNum: userCurrentPage.value,
      pageSize: userPageSize.value
    }).then(res => {
      return {
        list: res.rows || [],
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10,
  load: Promise.reject() // 初始不加载
});
const selectedUserList = ref<ISysUser[]>([]);

const resetUserQuery = () => {
  userQueryParams.value = DEFAULT_USER_PARAMS();
  userQueryParams.value.roleId = editData.value?.roleId;
  userOnSearch();
};

function handleCancelAuthUser(row?: ISysUser) {
  const userIds =
    row?.userId || selectedUserList.value.map(u => u.userId).join(',');
  authUserCancelAll({ roleId: editData.value.roleId, userIds }).then(() => {
    useMessage('messages.update_success');
    userGetData();
  });
}

// 添加用户
const showAddUserDialog = ref(false);
const addUserQueryParams = ref(DEFAULT_USER_PARAMS());
function handleAddUser() {
  showAddUserDialog.value = true;
  userQueryParams.value = { roleId: editData.value?.roleId };
  addUserGetData();
}
const {
  dataList: addUserData,
  totalCount: addUserTotalCount,
  pageSize: addUserPageSize,
  currentPage: addUserCurrentPage,
  loading: addUserLoading,
  getData: addUserGetData,
  onSearch: addUserOnSearch
} = useTable<ISysRole>({
  api: (): any =>
    unallocatedUserList({
      ...userQueryParams.value,
      pageNum: userCurrentPage.value,
      pageSize: userPageSize.value
    }).then(res => {
      return {
        list: res.rows || [],
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10,
  load: Promise.reject() // 初始不加载
});
const selectedAddUserList = ref<ISysUser[]>([]);

function resetAddUserQuery() {
  addUserQueryParams.value = DEFAULT_USER_PARAMS();
  addUserQueryParams.value.roleId = editData.value?.roleId;
  addUserOnSearch();
}

function onAddUserSubmit() {
  const userIds = selectedAddUserList.value.map(u => u.userId).join(',');
  if (!userIds) return onAddUserCancel();

  authUserSelectAll({ roleId: editData.value.roleId, userIds }).then(() => {
    useMessage('messages.update_success');
    userGetData();
    showAddUserDialog.value = false;
  });
}
function onAddUserCancel() {
  showAddUserDialog.value = false;
}

// 树操作
// 树权限（展开/折叠）
function handleCheckedTreeExpand(value: boolean, type: string) {
  if (type == 'menu') {
    for (let i = 0; i < menuOptions.value.length; i++) {
      if (menuRef.value?.store.nodesMap[menuOptions.value[i].id]) {
        menuRef.value.store.nodesMap[menuOptions.value[i].id].expanded = value;
      }
    }
  } else if (type == 'dept') {
    for (let i = 0; i < deptOptions.value.length; i++) {
      if (deptRef.value?.store.nodesMap[deptOptions.value[i].id]) {
        deptRef.value.store.nodesMap[deptOptions.value[i].id].expanded = value;
      }
    }
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(value: boolean, type: string) {
  if (type == 'menu') {
    menuRef.value?.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == 'dept') {
    deptRef.value?.setCheckedNodes(value ? deptOptions.value : []);
  }
}
// 树权限（父子联动）
function handleCheckedTreeConnect(value: boolean, type: string) {
  if (type == 'menu') {
    editData.value.menuCheckStrictly = value ? true : false;
  } else if (type == 'dept') {
    editData.value.deptCheckStrictly = value ? true : false;
  }
}
</script>
