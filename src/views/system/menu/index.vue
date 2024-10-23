<template>
  <div class="p-16px box-border">
    <el-form
      v-show="showSearch"
      ref="queryRef"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="菜单状态"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <XButton primary @click="handleQuery">搜索</XButton>
        <XButton @click="resetQuery">重置</XButton>
      </el-form-item>
    </el-form>

    <div class="flex space-x-16px mb-12px">
      <XButton
        v-permission="['system:menu:add']"
        primary
        plain
        @click="handleAdd"
        >新增</XButton
      >
      <XButton type="info" plain @click="toggleExpandAll">展开/折叠</XButton>
    </div>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="menuName"
        label="菜单名称"
        :show-overflow-tooltip="true"
        width="160"
      >
        <template #default="scope">
          <span>{{ $t(scope.row.menuName) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template #default="scope">
          <XIcon :name="scope.row.icon" size="24" />
        </template>
      </el-table-column>
      <el-table-column
        prop="orderNum"
        label="排序"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="perms"
        label="权限标识"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        prop="component"
        label="组件路径"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column prop="menuSystem" label="菜单权限">
        <template #default="scope">
          <span>{{ scope.row.menuSystem === 1 ? '管理' : '用户' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <XDictTag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        width="200"
        prop="createTime"
      >
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <XButton
            v-permission="['system:menu:edit']"
            link
            type="primary"
            @click="handleUpdate(scope.row)"
            >修改</XButton
          >
          <XButton
            v-permission="['system:menu:add']"
            link
            type="primary"
            @click="handleAdd(scope.row)"
            >新增</XButton
          >
          <XButton
            v-permission="['system:menu:remove']"
            link
            type="danger"
            @click="handleDelete(scope.row)"
            >删除</XButton
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <XDialog v-model="open" :title="title" width="680px">
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{
                  value: 'menuId',
                  label: 'menuName',
                  children: 'children'
                }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="24">
            <el-form-item label="菜单图标" prop="icon">
              <el-input
                v-model="form.icon"
                placeholder="输入图标名称（支持 https://icon-sets.iconify.design/ 所有图标）"
              >
                <template #prefix>
                  <XIcon v-if="form.icon" :name="form.icon" size="24" />
                </template>

                <template #append>
                  <el-link
                    href="https://icon-sets.iconify.design/"
                    target="_blank"
                    :underline="false"
                  >
                    图标库
                  </el-link>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input
                v-model="form.menuName"
                placeholder="请输入菜单名称（优先i18n）"
              >
                <template #prefix>
                  <span v-if="form.menuName">{{ $t(form.menuName) }}</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="菜单权限。分为管理员界面和用户界面"
                    placement="top"
                  >
                    菜单权限
                  </el-tooltip>
                </span>
              </template>
              <el-radio-group v-model="form.menuSystem">
                <el-radio :label="2">用户</el-radio>
                <el-radio :label="1">管理</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是外链则路由地址需要以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon> </el-tooltip
                  >是否外链
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="12">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType == 'C'" :span="12">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'M'" :span="12">
            <el-form-item>
              <el-input
                v-model="form.perms"
                placeholder="请输入权限标识"
                maxlength="100"
              />
              <template #label>
                <span>
                  <el-tooltip
                    content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType == 'C'" :span="12">
            <el-form-item>
              <el-input
                v-model="form.query"
                placeholder="请输入路由参数"
                maxlength="255"
              />
              <template #label>
                <span>
                  <el-tooltip
                    content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由参数
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType == 'C'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in sys_show_hide"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择停用则路由将不会出现在侧边栏，也不能被访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
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
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <XButton primary @click="submitForm">确 定</XButton>
          <XButton @click="cancel">取 消</XButton>
        </div>
      </template>
    </XDialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Menu' });
import {
  addMenu,
  delMenu,
  getMenu,
  listMenu,
  updateMenu
} from '@/api/system/menu';
import XButton from '@/components/button';
import XDialog from '@/components/dialog';
import XDictTag from '@/components/dictTag';
import XIcon from '@/components/icon';
import { useDict } from '@/hooks/useDict';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';
import { FormInstance } from 'element-plus';
import { ref, reactive, toRefs, nextTick } from 'vue';

const { sys_show_hide } = useDict('sys_show_hide');
const { sys_normal_disable } = useDict('sys_normal_disable');

const menuList = ref<any[]>([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref('');
const menuOptions = ref<any[]>([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);

const data = reactive<{
  form: any;
  queryParams: any;
  rules: any;
}>({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined
  },
  rules: {
    menuName: [
      { required: true, message: '菜单名称不能为空', trigger: 'blur' }
    ],
    orderNum: [
      { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
    ],
    path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

function handleTree(data: any, id: any, parentId?: any, children?: any) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: any) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}
/** 查询菜单列表 */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then(response => {
    menuList.value = handleTree(response.data, 'menuId');
    loading.value = false;
  });
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  listMenu().then((response: any) => {
    const menu: any = { menuId: 0, menuName: '主类目', children: [] };
    menu.children = handleTree(response.data, 'menuId');
    menuOptions.value.push(menu);
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
const menuRef = ref<FormInstance>();
/** 表单重置 */
function reset() {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: undefined,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    menuSystem: 2
  };
  menuRef.value?.resetFields();
}
/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
const queryRef = ref<FormInstance>();
/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields();
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd(row: any) {
  reset();
  getTreeselect();
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = '添加菜单';
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修改按钮操作 */
async function handleUpdate(row: any) {
  reset();
  await getTreeselect();
  getMenu(row.menuId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = '修改菜单';
  });
}
/** 提交按钮 */
function submitForm() {
  menuRef.value?.validate((valid: any) => {
    if (valid) {
      if (form.value.menuId !== undefined) {
        updateMenu(form.value).then(response => {
          useMessage('messages.update_success');
          open.value = false;
          getList();
        });
      } else {
        addMenu(form.value).then(response => {
          useMessage('messages.create_success');
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row: any) {
  useDeleteMessageBox(row.menuName, () => {
    delMenu(row.menuId)
      .then(() => {
        getList();
      })
      .catch(() => {});
  });
}

getList();
</script>
