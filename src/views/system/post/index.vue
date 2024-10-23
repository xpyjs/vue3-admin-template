<template>
  <div class="box-border p-16px">
    <el-form :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          v-model="queryParams.postCode"
          placeholder="请输入岗位编码"
          clearable
          @keyup.enter.native="onSearch"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          v-model="queryParams.postName"
          placeholder="请输入岗位名称"
          clearable
          @keyup.enter.native="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="岗位状态"
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
          v-permission="['system:post:add']"
          >新增</XButton
        >
      </el-col>
      <el-col :span="1.5">
        <XButton
          type="success"
          plain
          :disabled="selectedList.length !== 1"
          @click="handleUpdate"
          v-permission="['system:post:edit']"
          >修改</XButton
        >
      </el-col>
      <el-col :span="1.5">
        <XButton
          type="danger"
          plain
          :disabled="selectedList.length === 0"
          @click="() => handleDelete()"
          v-permission="['system:post:remove']"
          >删除</XButton
        >
      </el-col>
    </el-row>

    <XTable
      v-loading="loading"
      :data="dataList"
      :headers="[
        { prop: 'postId', label: '岗位编号' },
        { prop: 'postCode', label: '岗位编码' },
        { prop: 'postName', label: '岗位名称' },
        { prop: 'postSort', label: '岗位排序' },
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
        <XDictTag :options="sys_normal_disable" :value="scope.row.status" />
      </template>

      <template v-slot:operation="{ scope }">
        <XButton
          link
          type="primary"
          @click="handleUpdate(scope.row)"
          v-permission="['system:post:edit']"
          >修改</XButton
        >
        <XButton
          link
          type="danger"
          @click="handleDelete(scope.row)"
          v-permission="['system:post:remove']"
          >删除</XButton
        >
      </template>
    </XTable>

    <!-- 添加或修改岗位对话框 -->
    <XDialog :title="title" v-model="showDialog" width="500">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="{
          postName: [
            { required: true, message: '岗位名称不能为空', trigger: 'blur' }
          ],
          postCode: [
            { required: true, message: '岗位编码不能为空', trigger: 'blur' }
          ],
          postSort: [
            { required: true, message: '岗位顺序不能为空', trigger: 'blur' }
          ]
        }"
        label-width="100px"
      >
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="formData.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="formData.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number
            v-model="formData.postSort"
            controls-position="right"
            :min="0"
            class="w-full!"
          />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="formData.status">
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
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <XButton primary @click="onSubmit">确 定</XButton>
        <XButton @click="onEditCancel">取 消</XButton>
      </template>
    </XDialog>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Post' });
import {
  listPost,
  getPost,
  delPost,
  addPost,
  updatePost
} from '@/api/system/post';
import XDialog from '@/components/dialog';
import { useIcon } from '@/components/icon';
import XTable from '@/components/table';
import XDictTag from '@/components/dictTag';
import { useTable } from '@xpyjs/vue-ease';
import { ElForm } from 'element-plus';
import { ref } from 'vue';
import { useDict } from '@/hooks/useDict';
import XButton from '@/components/button';
import useMessage, { useDeleteMessageBox } from '@/hooks/useMessage';

const { sys_normal_disable } = useDict('sys_normal_disable');

const DEFAULT_PARAMS = () =>
  ({}) as {
    postCode?: string;
    postName?: string;
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
} = useTable({
  api: (): any =>
    listPost({
      ...queryParams.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }).then(res => {
      return {
        list: res.rows || [],
        total: res.total
      };
    }),
  currentPage: 1,
  pageSize: 10
});
const selectedList = ref<any[]>([]);

const resetQuery = () => {
  queryParams.value = DEFAULT_PARAMS();
  dateRange.value = [];
  onSearch();
};

function handleDelete(row?: any) {
  const user = row ? [row] : selectedList.value;
  user.length > 0 &&
    useDeleteMessageBox(user.map(u => u.postName).join(','), (res, rej) => {
      delPost(user.map(u => u.postId)).then(() => {
        getData();
        res(1);
      });
    });
}

// 修改数据权限
const DEFAULT_DATA = () =>
  ({
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined
  }) as Partial<any>;
const formData = ref<Partial<any>>(DEFAULT_DATA());
const title = ref('');
const showDialog = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
function handleAdd() {
  reset();
  showDialog.value = true;
  title.value = '添加岗位';
}
function handleUpdate(row?: any) {
  reset();
  const id = row?.postId || selectedList.value[0]?.postId;
  id !== undefined &&
    getPost(id).then(response => {
      formData.value = response.data;
      title.value = '修改岗位';
      showDialog.value = true;
    });
}

function onSubmit() {
  formRef.value?.validate(async valid => {
    if (valid) {
      if (formData.value.postId !== undefined) {
        await updatePost(formData.value);
        useMessage('messages.update_success');
      } else {
        await addPost(formData.value);
        useMessage('messages.create_success');
      }
      showDialog.value = false;
      getData();
    }
  });
}
function onEditCancel() {
  showDialog.value = false;
  reset();
}

function reset() {
  formData.value = DEFAULT_DATA();
  formRef.value?.resetFields();
}
</script>
