<template>
  <el-result
    icon="error"
    title="权限不足"
    subTitle="请根据提示进行操作"
    style="--el-result-icon-font-size: 1em"
  >
    <template #icon>
      <XIcon name="svg-icon:403" :size="300" />
    </template>
    <template #extra>
      <el-button type="primary" @click="onBack">返回</el-button>
    </template>
  </el-result>
</template>

<script lang="ts" setup>
import XIcon from '@/components/icon';
import { useRouter } from 'vue-router';

defineOptions({ name: 'ForbiddenPage' });

const { back } = useRouter();
function onBack() {
  back();
}
</script>

<style lang="scss" scoped></style>
