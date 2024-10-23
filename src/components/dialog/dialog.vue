<template>
  <el-dialog
    v-model="visible"
    class="XDialog rounded-24px! p-36px!"
    align-center
    append-to-body
    :center="center"
    destroy-on-close
    :close-on-click-modal="hideHeader ?? false"
    :show-close="false"
  >
    <template #header="{ close }" v-if="!hideHeader">
      <div class="flex justify-between items-center mb-24px">
        <div class="text-36px lh-44px font-medium flex-1">
          {{ title }}
        </div>

        <div
          class="box-border w-36px h-36px rounded-12px flex items-center justify-center cursor-pointer bg-[var(--x-color-primary)]"
          @click="close"
        >
          <XIcon
            name="material-symbols:close"
            size="18"
            color="var(--x-bg-color)"
          />
        </div>
      </div>
    </template>

    <slot :close="close" />

    <template #footer>
      <slot name="footer" :close="close" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import XIcon from '../icon';

defineProps({
  title: String,
  /**
   * 隐藏头部。当隐藏头部后，点击 modal 会默认关闭弹窗
   */
  hideHeader: Boolean,
  /**
   * 是否内容居中
   */
  center: { type: Boolean, default: true }
});

const visible = defineModel('visible', { default: false });

function close() {
  visible.value = false;
}

defineExpose({ close });
</script>

<style lang="scss">
.XDialog {
  .el-dialog__footer:empty {
    display: none;
  }
}
</style>
