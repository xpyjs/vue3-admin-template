<template>
  <XDrawer :loading="loading" size="50%">
    <template v-slot:header>
      <div class="text-6.85 lh-normal">
        <span class="text-[var(--x-text-color)]">{{
          props.data?.dictLabel
        }}</span>
      </div>
    </template>

    <el-form ref="formRef" :model="queryParams" :inline="true">
      <el-form-item label="字典类型" prop="dictType">
        <el-select v-model="queryParams.dictType" style="width: 150px">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.dictName"
            :value="item.dictType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
          v-model="queryParams.dictLabel"
          placeholder="请输入字典标签"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="数据状态"
          clearable
          style="width: 150px"
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
        >新增</XButton
      >
      <XButton
        v-permission="['system:dict:edit']"
        type="success"
        plain
        :disabled="selectedList.length !== 1"
        @click="handleUpdate"
        >修改</XButton
      >
      <XButton
        v-permission="['system:dict:remove']"
        type="danger"
        plain
        :disabled="selectedList.length === 0"
        @click="handleDelete"
        >删除</XButton
      >
    </div>

    <XTable
      v-loading="loading"
      :data="dataList"
      :headers="[
        { prop: 'dictCode', label: '字典编码' },
        { prop: 'dictLabel', label: '字典标签' },
        { prop: 'dictValue', label: '字典键值' },
        { prop: 'dictSort', label: '字典排序' },
        { prop: 'status', label: '状态' },
        {
          prop: 'createTime',
          label: '创建时间',
          timeFormatter: true,
          width: 150
        },
        { prop: 'operation', width: 100, align: 'right' }
      ]"
      use-selection
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      v-model:selected="selectedList"
      :pagination="{
        total: total
      }"
    >
      <template v-slot:dictLabel="{ scope }">
        <span
          v-if="scope.row.listClass == '' || scope.row.listClass == 'default'"
          >{{ scope.row.dictLabel }}</span
        >
        <el-tag
          v-else
          :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass"
          >{{ scope.row.dictLabel }}</el-tag
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
      <el-form ref="dataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number
            v-model="form.dictSort"
            controls-position="right"
            :min="0"
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
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
  </XDrawer>
</template>

<script setup lang="ts">
import useDictStore from '@/store/modules/dict';
import {
  optionselect as getDictOptionselect,
  getType
} from '@/api/system/dict/type';
import {
  listData,
  getData,
  delData,
  addData,
  updateData
} from '@/api/system/dict/data';
import { PropType, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDict } from '@/hooks/useDict';
import { cloneDeep } from 'lodash-es';
import { useTable } from '@xpyjs/vue-ease';
import { type FormInstance } from 'element-plus';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';
import XTable from '@/components/table';
import XIcon from '@/components/icon';
import XDictTag from '@/components/dictTag';
import XDrawer from '@/components/drawer';
import XDialog from '@/components/dialog';
import XButton from '@/components/button';

const props = defineProps({
  data: {
    type: Object as PropType<IDictValue>
  }
});

const { sys_normal_disable } = useDict('sys_normal_disable');

const selectedList = ref<any[]>([]);
const title = ref('');
const defaultDictType = ref('');
const typeOptions = ref<any[]>([]);

// 数据标签回显样式
const listClassOptions = ref([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' }
]);

const rules = ref({
  dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
  dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
  dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
});

/** 查询字典类型列表 */
getDictOptionselect().then(response => {
  typeOptions.value = response.data;
});

const {
  dataList,
  totalCount: total,
  pageSize,
  currentPage,
  loading,
  getData: getList
} = useTable({
  api: (): any =>
    listData({
      ...queryParams.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }).then(res => {
      return {
        list: res.rows,
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10,
  load: getType(props.data?.dictId).then(response => {
    queryParams.value.dictType = response.data.dictType;
    defaultDictType.value = response.data.dictType;
  })
});

const queryParams = ref<Record<string, any>>({
  dictName: undefined,
  dictType: undefined,
  dictLabel: undefined,
  status: undefined
});

// 对话框参数
const DEFAULT_FORM: Record<string, any> = {
  dictCode: undefined,
  dictLabel: undefined,
  dictValue: undefined,
  cssClass: undefined,
  listClass: 'default',
  dictSort: 0,
  status: '0',
  remark: undefined
};
const form = ref(cloneDeep(DEFAULT_FORM));
const dialogVisible = ref(false);

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}

// 搜索栏
const formRef = ref<FormInstance>();
// 对话框
const dataRef = ref<FormInstance>();
function reset() {
  form.value = cloneDeep(DEFAULT_FORM);
  dataRef.value?.resetFields();
}
/** 搜索按钮操作 */
function handleQuery() {
  currentPage.value = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {};
  queryParams.value.dictType = defaultDictType.value;
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  title.value = '添加字典数据';
  form.value.dictType = queryParams.value.dictType;
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
  reset();
  const dictCode =
    row.dictCode || selectedList.value.map((item: any) => item.dictCode);
  getData(dictCode).then(response => {
    form.value = response.data;
    dialogVisible.value = true;
    title.value = '修改字典数据';
  });
}
/** 提交按钮 */
function submitForm() {
  dataRef.value?.validate(valid => {
    if (valid) {
      if (form.value.dictCode !== undefined) {
        updateData(form.value).then(() => {
          useDictStore().removeDict(queryParams.value.dictType);
          useMessage('messages.update_success');
          dialogVisible.value = false;
          getList();
        });
      } else {
        addData(form.value).then(() => {
          useDictStore().removeDict(queryParams.value.dictType);
          useMessage('messages.create_success');
          dialogVisible.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row: any) {
  const dictCodes =
    row.dictCode || selectedList.value.map((item: any) => item.dictCode);
  useDeleteMessageBox('字典编码为"' + dictCodes + '"的数据项', (res, rej) => {
    delData(dictCodes).then(() => {
      getList();
      res(1);
    });
  });
}
</script>

<style lang="scss"></style>
