<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :destroy-on-close="true"
    :show-close="false"
    v-bind="$attrs"
  >
    <template v-slot:header="{ close }">
      <slot name="header" />

      <div class="flex items-center space-x-12px">
        <XIcon
          :name="
            appStore.drawerOverlay
              ? 'bi:layout-sidebar-inset-reverse'
              : 'codicon:layout-sidebar-right'
          "
          size="14px"
          class="cursor-pointer"
          @click="
            () => {
              appStore.toggleDrawerOverlay();
            }
          "
        />
        <XIcon
          class="cursor-pointer"
          name="material-symbols:close"
          size="18"
          @click="close"
        />
      </div>
    </template>

    <div v-loading="loading">
      <slot />
    </div>

    <template v-slot:footer>
      <slot name="footer" :close="close" />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import XIcon from '../icon';
import { useAppStore } from '@/store/modules/app';

defineProps({ loading: Boolean });

const visible = defineModel('visible', { default: false });

const appStore = useAppStore();

function close() {
  visible.value = false;
}

defineExpose({ close });
</script>

<style lang="scss"></style>
