<template>
  <el-result
    icon="warning"
    title="找不到页面"
    subTitle="请根据提示进行操作"
    style="--el-result-icon-font-size: 1em"
  >
    <template #icon>
      <XIcon name="svg-icon:404" :size="300" />
    </template>
    <template #extra>
      <el-button type="primary" @click="onBack">返回</el-button>
    </template>
  </el-result>
</template>

<script lang="ts" setup>
import XIcon from '@/components/icon';
import { useRouter } from 'vue-router';

defineOptions({ name: 'NotFoundPage' });

const { back, currentRoute, replace } = useRouter();
function onBack() {
  back();
}

if (currentRoute.value.query.from === 'login') {
  replace('/');
}
</script>

<style lang="scss" scoped></style>
