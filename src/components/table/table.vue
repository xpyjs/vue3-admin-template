<template>
  <div>
    <template v-if="$slots.toolbar">
      <slot name="toolbar" />
    </template>

    <el-table
      :data="data"
      class="x-table"
      style="width: 100%"
      ref="tableRef"
      :header-cell-style="{
        'font-size': '0.9rem',
        'font-weight': 'normal',
        'line-height': 1.5,
        'border-bottom': '1px solid var(--x-table-header-border)'
      }"
      show-overflow-tooltip
      :tooltip-options="{
        enterable: true,
        placement: 'top',
        showArrow: false,
        showAfter: 200
      }"
      cell-class-name="text-4"
      v-bind="$attrs"
      @selection-change="val => (selected = val)"
    >
      <el-table-column v-if="useSelection" type="selection" width="55" />

      <template v-for="h in headers">
        <el-table-column v-if="h.prop !== 'operation'" v-bind="h">
          <template #="scope">
            <!-- 支持具名插槽 -->
            <slot :name="h.prop" :scope="scope">
              <!-- 默认格式化时间 -->
              <template v-if="h.timeFormatter">
                <div class="flex items-center">
                  <XIcon
                    v-if="scope.row?.[h.prop ?? '']"
                    name="fluent:calendar-48-regular"
                    class="mr-6px"
                  />
                  {{
                    timeFormatter(scope.row?.[h.prop ?? ''], h.timeFormatter)
                  }}
                </div>
              </template>

              <!-- 默认状态列样式 -->
              <template v-else-if="h.status">
                <span
                  class="status-col text-[var(--status-col-color)]"
                  :style="{
                    '--status-col-color':
                      `${scope.row?.[h.prop ?? '']}` === '0'
                        ? 'var(--el-color-success)'
                        : 'var(--x-text-second-color)'
                  }"
                >
                  {{
                    $t(
                      `${scope.row?.[h.prop ?? '']}` === '0'
                        ? 'base.normal'
                        : 'base.stopped'
                    )
                  }}
                </span>
              </template>

              <template v-else>
                {{ scope.row?.[h.prop ?? ''] }}
                <template v-if="h.copy">
                  <XIcon
                    name="line-md:clipboard-list"
                    class="ml-4px cursor-pointer"
                    @click="
                      copy(scope.row?.[h.prop ?? ''] ?? '').then(() =>
                        useMessage('messages.copied')
                      )
                    "
                  />
                </template>
              </template>
            </slot>
          </template>
        </el-table-column>

        <!-- 在 headers 中声明了 operation，优先级比下面默认插槽列高 -->
        <el-table-column v-else fixed="right" v-bind="h">
          <template #default="scope">
            <div class="flex items-center">
              <slot name="operation" :scope="scope" />
            </div>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="$slots.operation && !headers?.find(h => h.prop === 'operation')"
        fixed="right"
        width="150"
      >
        <template #default="scope">
          <div class="flex items-center">
            <slot name="operation" :scope="scope" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <XPagination
      v-if="!!pagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :pagination="props.pagination"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, type PropType } from 'vue';
import { ElTable, ElTableColumn, type TableColumnInstance } from 'element-plus';
import XPagination from '@/components/pagination';
import XIcon from '@/components/icon';
import { useClipboard, useTimeAgo } from '@vueuse/core';
import { useMessage } from '@/hooks/useMessage';
import { formatDate } from '@/utils/date';
defineOptions({ name: 'XTable' });

const props = defineProps({
  sort: String,

  data: {
    type: Array
  },
  headers: {
    type: Array as PropType<
      (TableColumnInstance['$props'] & {
        /**
         * 格式化时间
         */
        timeFormatter?: boolean | string;
        /**
         * 使用状态列默认样式
         */
        status?: boolean;
        /**
         * 允许复制当前内容
         */
        copy?: boolean;
      })[]
    >
  },

  useSelection: Boolean,

  pagination: {
    type: Object as PropType<{
      total: number;
      position?: 'left' | 'right';
      layout?: string;
    }>
  }
});

const currentPage = defineModel<number>('currentPage', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 10 });

// 选择的双向绑定
const selected = defineModel<any[]>('selected', { default: [] });
const tableRef = ref<InstanceType<typeof ElTable>>();
watchEffect(() => {
  selected.value.forEach(row => {
    tableRef.value?.toggleRowSelection(row, true);
  });
});
defineExpose({ tableRef });

function timeFormatter(time?: string, formatter?: string | boolean) {
  if (!time) return '';
  if (typeof formatter === 'string') return formatDate(time, formatter);
  return useTimeAgo(time).value;
}

const { copy } = useClipboard();
</script>

<style scoped lang="scss">
.x-table {
  :deep(.el-checkbox) {
    --el-checkbox-border-radius: 4px;
  }

  :deep(.el-checkbox .el-checkbox__inner) {
    &:after {
      border-radius: 1px;
      width: 3px;
      height: 5px;
      left: 4px;
      top: 1px;
      border-width: 2px;
      transform: rotate(45deg) scaleY(1) translateY(10%);
    }
  }

  :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
    background-color: var(--x-text-color);
    border-color: var(--x-text-color);

    &:before {
      background-color: var(--x-bg-color);
    }
  }

  :deep(.el-table-fixed-column--right.is-first-column::before) {
    bottom: 0px;
  }

  .status-col {
    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
      background-color: var(--status-col-color);
    }
  }
}
</style>
