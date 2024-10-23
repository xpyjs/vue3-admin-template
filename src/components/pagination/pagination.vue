<template>
  <el-pagination
    background
    class="mt-12px"
    :style="{
      float: pagination.position ?? 'right',
      '--el-disabled-bg-color': 'transparent',
      '--el-pagination-button-bg-color': 'transparent',
      '--el-color-primary': 'var(--x-tabs-bg-color)',
      '--el-color-white': 'var(--x-text-color)',
      '--el-pagination-hover-color': 'var(--x-text-color)',
      '--el-pagination-border-radius': '8px'
    }"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    v-bind="paginationConfig"
  >
  </el-pagination>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps({
  pagination: {
    type: Object,
    default: () => ({})
  }
});

const currentPage = defineModel<number>('currentPage', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 10 });

const paginationConfig = computed(() => {
  return Object.assign(
    {
      layout: 'total, jumper, prev, pager, next',
      pageSizes: [10, 20, 30, 40, 50, 100]
    },
    props.pagination
  );
});
</script>
