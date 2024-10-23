<template>
  <div class="box-border p-16px">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <XInput
            v-model="deptName"
            placeholder="请输入部门名称"
            search
            style="margin-bottom: 20px"
            clearable
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="deptData"
            :props="{
              children: 'children',
              label: 'label'
            }"
            :expand-on-click-node="false"
            :filter-node-method="
              (value: any, data: any) => {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
              }
            "
            ref="treeRef"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="
              (data: any) => {
                queryParams.deptId = data.id;
                onSearch();
              }
            "
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="onSearch"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 240px"
              @keyup.enter.native="onSearch"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
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
              v-permission="['system:user:add']"
              >新增</XButton
            >
          </el-col>
          <el-col :span="1.5">
            <XButton
              type="success"
              plain
              :disabled="selectedList.length !== 1"
              @click="handleUpdate"
              v-permission="['system:user:edit']"
              >修改</XButton
            >
          </el-col>
          <el-col :span="1.5">
            <XButton
              type="danger"
              plain
              :disabled="selectedList.length === 0"
              @click="() => handleDelete()"
              v-permission="['system:user:remove']"
              >删除</XButton
            >
          </el-col>
        </el-row>

        <XTable
          v-loading="loading"
          :data="dataList"
          :headers="[
            { prop: 'userId', label: '用户编号' },
            { prop: 'userName', label: '用户名称', showOverflowTooltip: true },
            { prop: 'nickName', label: '用户昵称', showOverflowTooltip: true },
            { prop: 'deptName', label: '部门', showOverflowTooltip: true },
            { prop: 'phonenumber', label: '手机号码', width: 120 },
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

          <template v-slot:deptName="{ scope }">
            {{ scope.row.dept?.deptName }}
          </template>

          <template v-slot:operation="{ scope }">
            <XButton
              v-if="scope.row.userId !== 1"
              link
              type="primary"
              @click="handleUpdate(scope.row)"
              v-permission="['system:user:edit']"
              >修改</XButton
            >
            <XButton
              v-if="scope.row.userId !== 1"
              link
              type="danger"
              @click="handleDelete(scope.row)"
              v-permission="['system:user:remove']"
              >删除</XButton
            >
            <el-dropdown
              v-if="scope.row.userId !== 1"
              trigger="click"
              @command="(command: string) => handleCommand(command, scope.row)"
              v-permission="['system:user:resetPwd', 'system:user:edit']"
            >
              <XButton link type="info" class="ml-12px">更多</XButton>
              <template v-slot:dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="handleResetPwd"
                    :icon="
                      useIcon({ name: 'fluent:password-reset-48-regular' })
                    "
                    v-permission="['system:user:resetPwd']"
                    >重置密码</el-dropdown-item
                  >
                  <el-dropdown-item
                    command="handleAuthRole"
                    :icon="useIcon({ name: 'ion:bag-check-outline' })"
                    v-permission="['system:user:edit']"
                    >分配角色</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </XTable>
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <XDialog :title="editDialogTitle" v-model="showEditDialog" width="600">
      <el-form
        ref="editDialogFormRef"
        :model="editData"
        :rules="editRules"
        label-width="80px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="editData.nickName"
                placeholder="请输入用户昵称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="editData.deptId"
                :data="deptData"
                :render-after-expand="false"
                placeholder="请选择归属部门"
                :props="{
                  children: 'children',
                  label: 'label'
                }"
                node-key="id"
                highlight-current
              >
                <template #="{ data }">
                  {{ data.label }}
                  <span v-if="data.children?.length">
                    ({{ data.children.length }})
                  </span>
                </template>
              </el-tree-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="editData.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="editData.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="editData.userId == undefined"
              label="用户名称"
              prop="userName"
            >
              <el-input
                v-model="editData.userName"
                placeholder="请输入用户名称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="editData.userId == undefined"
              label="用户密码"
              prop="password"
            >
              <el-input
                v-model="editData.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="editData.sex" placeholder="请选择性别">
                <el-option
                  v-for="dict in sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select
                v-model="editData.postIds"
                multiple
                placeholder="请选择岗位"
              >
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select
                v-model="editData.roleIds"
                multiple
                placeholder="请选择角色"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="editData.remark"
                type="textarea"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <XButton primary @click="onEditSubmit">确 定</XButton>
        <XButton @click="onEditCancel">取 消</XButton>
      </template>
    </XDialog>

    <!-- 分配角色对话框 -->
    <XDialog title="分配角色" v-model="showAuthRoleDialog" width="800">
      <XTable
        v-loading="roleLoading"
        :data="roleData"
        :headers="[
          { prop: 'roleId', label: '角色编号' },
          { prop: 'roleName', label: '角色名称' },
          { prop: 'rokeKey', label: '权限字符' },
          { prop: 'createTime', label: '创建时间', width: 180 }
        ]"
        use-selection
        v-model:selected="selectedRoleList"
        ref="tableRef"
        @row-click="onClickRoleTableRow"
      >
      </XTable>

      <template v-slot:footer>
        <XButton primary @click="onRoleSubmit">确 定</XButton>
        <XButton @click="onRoleCancel">取 消</XButton>
      </template>
    </XDialog>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'User' });
import {
  getUsers,
  getUser,
  deleteUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  getDeptTreeSelect,
  getAuthRole,
  updateAuthRole
} from '@/api/system/user';
import XDialog from '@/components/dialog';
import XIcon, { useIcon } from '@/components/icon';
import XInput from '@/components/input';
import XTable from '@/components/table';
import { useTable } from '@xpyjs/vue-ease';
import { ElForm, ElTree, FormRules, ElMessageBox } from 'element-plus';
import { nextTick, reactive, ref, watch } from 'vue';
import { useDict } from '@/hooks/useDict';
import XButton from '@/components/button';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';

const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable');

const DEFAULT_PARAMS = () =>
  ({}) as {
    userName?: string;
    phonenumber?: string;
    status?: string;
    deptId?: string;
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
} = useTable<ISysUser>({
  api: (): any =>
    getUsers({
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
const selectedList = ref<ISysUser[]>([]);

const resetQuery = () => {
  queryParams.value = DEFAULT_PARAMS();
  dateRange.value = [];
  onSearch();
};

function handleStatusChange(row: any) {
  const status = row.status === '0' ? '1' : '0';
  changeUserStatus(row.userId, status)
    .then((res: any) => {
      useMessage('messages.update_success');
      row.status = status;
    })
    .catch(() => {
      row.status = status === '0' ? '1' : '0';
    });
}

function handleDelete(row?: ISysUser) {
  const user = row ? [row] : selectedList.value;
  user.length > 0 &&
    useDeleteMessageBox(user.map(u => u.nickName).join(','), (res, rej) => {
      deleteUser(user.map(u => u.userId)).then(() => {
        getData();
        res(1);
      });
    });
}
function handleCommand(command: string, row: ISysUser) {
  switch (command) {
    case 'handleResetPwd':
      handleResetPwd(row);
      break;
    case 'handleAuthRole':
      handleAuthRole(row);
      break;
    default:
      break;
  }
}
/** 重置密码按钮操作 */
function handleResetPwd(row: ISysUser) {
  ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
    inputValidator: value => {
      if (/<|>|"|'|\||\\/.test(value)) {
        return '不能包含非法字符：< > " \' \\\ |';
      }
      return true;
    }
  })
    .then(({ value }) => {
      resetUserPwd(row.userId, value).then(response => {
        useMessage('修改成功，新密码是：' + value);
      });
    })
    .catch(() => {});
}

const deptName = ref('');
const deptData = ref([]);
getDeptTreeSelect().then(res => {
  deptData.value = res.data;
});

const treeRef = ref<InstanceType<typeof ElTree>>();
watch(
  () => deptName.value,
  val => {
    treeRef.value?.filter(val);
  }
);

// 编辑对话框内容
const editDialogTitle = ref('');
const showEditDialog = ref(false);
const DEFAULT_EDIT_DATA = () =>
  ({
    status: '0',
    postIds: [],
    roleIds: []
  }) as Partial<ISysUser>;
const editData = ref(DEFAULT_EDIT_DATA());
const editRules = reactive<FormRules>({
  userName: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '用户名称长度必须介于 2 和 20 之间',
      trigger: 'blur'
    }
  ],
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度必须介于 5 和 20 之间',
      trigger: 'blur'
    },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: '不能包含非法字符：< > " \' \\\ |',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  phonenumber: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
});
const editDialogFormRef = ref<InstanceType<typeof ElForm>>();
const postOptions = ref<any[]>([]);
let roleOptions = ref<any[]>([]);
function handleAdd() {
  getUser().then(response => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    editData.value = { password: '123456' };
    editDialogTitle.value = '新增用户';
    showEditDialog.value = true;
  });
}
function handleUpdate(row: any) {
  const id = row.userId || selectedList.value[0]?.userId;
  id !== undefined &&
    getUser(id).then(response => {
      editData.value = response.data;
      postOptions.value = response.posts;
      roleOptions.value = response.roles;
      editDialogTitle.value = '修改用户';
      showEditDialog.value = true;
      editData.value.password = '';
    });
}
function onEditSubmit() {
  editDialogFormRef.value?.validate(async valid => {
    if (valid) {
      if (editData.value.userId) {
        await updateUser(editData.value);
      } else {
        await addUser(editData.value);
      }
      showEditDialog.value = false;
      getData();
    }
  });
}
function onEditCancel() {
  showEditDialog.value = false;
  editData.value = DEFAULT_EDIT_DATA();
  editDialogFormRef.value?.resetFields();
}

// 分配角色对话框
const showAuthRoleDialog = ref(false);
const selectedUserId = ref();
const roleData = ref<ISysRole[]>([]);
const tableRef = ref<InstanceType<typeof XTable>>();
const roleLoading = ref(false);
const selectedRoleList = ref<ISysRole[]>([]);

function handleAuthRole(row: ISysUser) {
  roleLoading.value = true;
  selectedUserId.value = row.userId;
  showAuthRoleDialog.value = true;
  getAuthRole(row.userId)
    .then((res: any) => {
      roleData.value = res.roles;
      nextTick(() => {
        // 选中已添加的角色
        roleData.value.forEach((role: any) => {
          if (role.flag) {
            tableRef.value?.tableRef?.toggleRowSelection(role);
          }
        });
      });
    })
    .finally(() => {
      roleLoading.value = false;
    });
}

function onRoleSubmit() {
  const roleIds = selectedRoleList.value.map(role => role.roleId).join(',');
  updateAuthRole({ userId: selectedUserId.value, roleIds }).then(() => {
    useMessage('messages.update_success');
    onRoleCancel();
  });
}
function onRoleCancel() {
  showAuthRoleDialog.value = false;
  roleData.value = [];
  selectedRoleList.value = [];
}

function onClickRoleTableRow(row: any) {
  tableRef.value?.tableRef?.toggleRowSelection(row);
}
</script>
