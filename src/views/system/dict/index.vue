<template>
  <div class="p-16px box-border">
    <el-form ref="formRef" :model="queryParams" :inline="true">
      <el-form-item label="字典名称" prop="dictName">
        <el-input
          v-model="queryParams.dictName"
          placeholder="请输入字典名称"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input
          v-model="queryParams.dictType"
          placeholder="请输入字典类型"
          clearable
          style="width: 180px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="字典状态"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 300px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-16px">
      <XButton
        v-permission="['system:dict:add']"
        type="primary"
        plain
        @click="handleAdd"
      >
        新增
      </XButton>
      <XButton
        v-permission="['system:dict:edit']"
        type="success"
        plain
        :disabled="selectedList.length !== 1"
        @click="handleUpdate"
      >
        修改
      </XButton>
      <XButton
        v-permission="['system:dict:remove']"
        type="danger"
        plain
        :disabled="selectedList.length === 0"
        @click="handleDelete"
      >
        删除
      </XButton>
      <XButton
        v-permission="['system:dict:remove']"
        type="danger"
        plain
        @click="handleRefreshCache"
      >
        刷新缓存
      </XButton>
    </div>

    <XTable
      v-loading="loading"
      :data="dataList"
      :headers="[
        { prop: 'dictId', label: $t('base.table_no'), width: 80 },
        { prop: 'dictName', label: '字典名称', showOverflowTooltip: true },
        { prop: 'dictType', label: '字典类型', showOverflowTooltip: true },
        { prop: 'status', label: '状态' },
        { prop: 'remark', label: '备注', showOverflowTooltip: true },
        {
          prop: 'createTime',
          label: '创建时间',
          timeFormatter: true
        }
      ]"
      use-selection
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      v-model:selected="selectedList"
      :pagination="{
        total: total
      }"
    >
      <template v-slot:dictType="{ scope }">
        <XButton
          link
          type="info"
          @click="
            () => {
              setDrawer(ModifyType, {
                width: 800,
                data: scope.row
              });
            }
          "
          >{{ scope.row.dictType }}</XButton
        >
      </template>

      <template v-slot:status="{ scope }">
        <XDictTag :options="sys_normal_disable" :value="scope.row.status" />
      </template>

      <template v-slot:operation="{ scope }">
        <XIcon
          v-permission="['system:dict:edit']"
          name="iconoir:edit"
          class="cursor-pointer"
          @click="handleUpdate(scope.row)"
        />
        <XIcon
          v-permission="['system:dict:remove']"
          name="fluent:delete-12-regular"
          class="cursor-pointer"
          @click="handleDelete(scope.row)"
        />
      </template>
    </XTable>

    <!-- 添加或修改参数配置对话框 -->
    <XDialog v-model="dialogVisible" :title="title" width="500px">
      <el-form
        ref="dictRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        draggable
      >
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <XButton primary @click="submitForm">确 定</XButton>
        <XButton @click="cancel">取 消</XButton>
      </template>
    </XDialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Dict' });

import useDictStore from '@/store/modules/dict';
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
  refreshCache
} from '@/api/system/dict/type';
import { ref } from 'vue';
import { useDict } from '@/hooks/useDict';
import XTable from '@/components/table';
import XDictTag from '@/components/dictTag';
import XIcon from '@/components/icon';
import { cloneDeep } from 'lodash-es';
import { useTable } from '@xpyjs/vue-ease';
import { type FormInstance } from 'element-plus';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';
import XDialog from '@/components/dialog';
import XButton from '@/components/button';
import { useDrawer } from '@/components/drawer/useDrawer';
import ModifyType from './modifyType.vue';

const { sys_normal_disable, reload } = useDict('sys_normal_disable');
const { setDrawer } = useDrawer();

const selectedList = ref<any[]>([]);
const title = ref('');
const dateRange = ref<any>([]);

const rules = ref({
  dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
  dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
});

const {
  dataList,
  totalCount: total,
  pageSize,
  currentPage,
  loading,
  getData
} = useTable({
  api: (): any =>
    listType({
      ...queryParams.value,
      params: {
        beginTime: dateRange.value[0],
        endTime: dateRange.value[1]
      },
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }).then(res => {
      return {
        list: res.rows,
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10
});

const queryParams = ref({
  dictName: undefined,
  dictType: undefined,
  status: undefined
});

// 对话框参数
const dialogVisible = ref(false);
const DEFAULT_FORM = {
  dictId: undefined,
  dictName: undefined,
  dictType: undefined,
  status: '0',
  remark: undefined
};
const form = ref(cloneDeep(DEFAULT_FORM));

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}
/** 表单重置 */
const formRef = ref<any>();
function reset() {
  form.value = cloneDeep(DEFAULT_FORM);
  dateRange.value = [];
  formRef.value.resetFields();
}
/** 搜索按钮操作 */
function handleQuery() {
  currentPage.value = 1;
  getData();
}
/** 重置按钮操作 */
function resetQuery() {
  reset();
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  title.value = '添加字典类型';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
  reset();
  const dictId =
    row.dictId || selectedList.value.map((item: any) => item.dictId);
  getType(dictId).then(response => {
    form.value = response.data;
    dialogVisible.value = true;
    title.value = '修改字典类型';
  });
}

const dictRef = ref<FormInstance>();
/** 提交按钮 */
function submitForm() {
  dictRef.value?.validate(valid => {
    if (valid) {
      if (form.value.dictId !== undefined) {
        updateType(form.value).then(() => {
          useMessage('messages.update_success');
          dialogVisible.value = false;
          getData();
        });
      } else {
        addType(form.value).then(() => {
          useMessage('messages.create_success');
          dialogVisible.value = false;
          getData();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row: any) {
  const dictIds =
    row.dictId || selectedList.value.map((item: any) => item.dictId);
  useDeleteMessageBox('字典编号为"' + dictIds + '"的数据项', (res, rej) => {
    delType(dictIds).then(() => {
      getData();
      res(1);
    });
  });
}
/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    useMessage('messages.refresh_success');
    useDictStore().cleanDict();
    reload();
  });
}

getData();
</script>
