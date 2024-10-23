<template>
  <ElDropdown
    ref="elDropdownRef"
    :trigger="trigger"
    placement="bottom-start"
    @command="command"
    @visible-change="visibleChange"
  >
    <slot></slot>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="(item, index) in menu"
          :key="`context-menu-${index}`"
          :divided="item.divided"
          :disabled="item.disabled"
          :command="item"
          class="lh-normal"
        >
          <XIcon
            v-if="menu.filter(m => !!m.icon).length > 0"
            :name="item.icon"
            :size="14"
          />
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
import { type ElDropdown } from 'element-plus';
import XIcon from '../icon';
import { onMounted, onUnmounted, PropType, ref } from 'vue';

defineOptions({ name: 'XContextMenu' });
const props = defineProps({
  /**
   * 菜单 id
   */
  id: {
    type: [String, Number, Symbol] as PropType<String | Number | Symbol>,
    default: () => Symbol()
  },

  /**
   * 触发方式。默认 contextmenu
   */
  trigger: {
    type: String as PropType<'click' | 'hover' | 'focus' | 'contextmenu'>,
    default: 'contextmenu'
  },

  menu: {
    type: Array as PropType<IMenu[]>,
    default: () => []
  }
});
const emit = defineEmits(['visible-change']);

const command = (item: IMenu) => {
  item.command && item.command(item);
};

function visibleChange(visible: boolean) {
  emit('visible-change', visible, props.id);
}

const elDropdownRef = ref<InstanceType<typeof ElDropdown>>();
defineExpose({ elDropdownRef, id: props.id });

function hide() {
  elDropdownRef.value?.handleClose();
}
onMounted(() => {
  document.addEventListener('contextmenu', hide, { capture: true });
});
onUnmounted(() => {
  document.removeEventListener('contextmenu', hide, { capture: true });
});
</script>

<style scoped lang="scss"></style>
