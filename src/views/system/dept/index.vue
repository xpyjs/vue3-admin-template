<template>
  <div class="p-16px box-border">
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="部门状态"
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
        v-permission="['system:dept:add']"
        primary
        plain
        @click="handleAdd"
        >新增</XButton
      >
      <XButton type="info" plain @click="toggleExpandAll">展开/折叠</XButton>
    </div>

    <XTable
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :headers="[
        {
          prop: 'deptName',
          label: '部门名称',
          showOverflowTooltip: true,
          width: 260
        },
        { prop: 'orderNum', label: '排序', width: 200 },
        { prop: 'status', label: '状态' },
        {
          prop: 'createTime',
          label: '创建时间',
          timeFormatter: true
        },
        { prop: 'operation', width: 200 }
      ]"
    >
      <template v-slot:status="{ scope }">
        <XDictTag :options="sys_normal_disable" :value="scope.row.status" />
      </template>

      <template v-slot:operation="{ scope }">
        <XButton
          v-permission="['system:dept:edit']"
          link
          type="primary"
          @click="handleUpdate(scope.row)"
          >修改</XButton
        >
        <XButton
          v-permission="['system:dept:add']"
          link
          type="primary"
          @click="handleAdd(scope.row)"
          >新增</XButton
        >
        <XButton
          v-if="scope.row.parentId !== 0"
          v-permission="['system:dept:remove']"
          link
          type="danger"
          @click="handleDelete(scope.row)"
          >删除</XButton
        >
      </template>
    </XTable>

    <!-- 添加或修改菜单对话框 -->
    <XDialog v-model="open" :title="title" width="680px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row v-if="form.parentId !== 0">
          <el-col :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{
                  value: 'deptId',
                  label: 'deptName',
                  children: 'children'
                }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
                class="w-full!"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input
                v-model="form.leader"
                placeholder="请输入负责人"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入联系电话"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
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
defineOptions({ name: 'Dept' });
import {
  listDept,
  getDept,
  delDept,
  addDept,
  updateDept,
  listDeptExcludeChild
} from '@/api/system/dept';
import XButton from '@/components/button';
import XDialog from '@/components/dialog';
import XDictTag from '@/components/dictTag';
import XTable from '@/components/table';
import { useDict } from '@/hooks/useDict';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';
import { FormInstance } from 'element-plus';
import { ref, reactive, toRefs, nextTick } from 'vue';

const { sys_normal_disable } = useDict('sys_normal_disable');

const deptList = ref<any[]>([]);
const open = ref(false);
const loading = ref(true);
const title = ref('');
const deptOptions = ref<any[]>([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);

const data = reactive<{
  form: any;
  queryParams: any;
  rules: any;
}>({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [
      { required: true, message: '上级部门不能为空', trigger: 'blur' }
    ],
    deptName: [
      { required: true, message: '部门名称不能为空', trigger: 'blur' }
    ],
    orderNum: [
      { required: true, message: '显示排序不能为空', trigger: 'blur' }
    ],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    phone: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
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
  listDept(queryParams.value).then(response => {
    deptList.value = handleTree(response.data, 'deptId');
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
const formRef = ref<FormInstance>();
/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: undefined,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0'
  };
  formRef.value?.resetFields();
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
  if (row) {
    form.value.parentId = row.deptId;
  }
  open.value = true;
  title.value = '添加部门';
  listDept().then(response => {
    deptOptions.value = handleTree(response.data, 'deptId');
  });
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
  getDept(row.deptId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = '修改菜单';

    listDeptExcludeChild(row.deptId).then(response => {
      deptOptions.value = handleTree(response.data, 'deptId');
      if (deptOptions.value.length == 0) {
        const noResultsOptions = {
          deptId: form.value.parentId,
          deptName: form.value.parentName,
          children: []
        };
        deptOptions.value.push(noResultsOptions);
      }
    });
  });
}
/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid: any) => {
    if (valid) {
      if (form.value.deptId !== undefined) {
        updateDept(form.value).then(response => {
          useMessage('messages.update_success');
          open.value = false;
          getList();
        });
      } else {
        addDept(form.value).then(response => {
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
  useDeleteMessageBox(row.deptName, () => {
    delDept(row.deptId)
      .then(() => {
        getList();
      })
      .catch(() => {});
  });
}

getList();
</script>
