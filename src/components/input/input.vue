<template>
  <div
    v-if="label"
    class="x-input w-full box-border rounded-16px ba w-full p-16px overflow-hidden hover:b-[var(--el-border-color-hover)] transition"
    :class="[
      { '!b-[var(--el-color-primary)]': focused },
      {
        'bg-[var(--x-bg-disabled-color)]': readonly
      }
    ]"
  >
    <div
      class="text-3.6 lh-normal color-[var(--x-text-second-color)] cursor-default"
    >
      {{ label }}
    </div>

    <el-input
      v-if="!readonly"
      ref="inputRef"
      :placeholder="$t('base.input_placeholder')"
      v-model="text"
      v-bind="omit($attrs, ['class', 'style'])"
      :class="{ 'is-error': isError }"
      :prefix-icon="search ? SearchComp : ''"
      autocomplete="off"
      @focus="focused = true"
      @blur="
        focused = false;
        handleValidate();
      "
    >
      <slot />
    </el-input>

    <div
      v-else
      class="text-4 lh-normal color-[var(--x-text-disabled-color)] min-h-20px mt-8px"
    >
      {{ text }}
    </div>
  </div>

  <el-input
    v-else
    ref="inputRef"
    v-model="text"
    v-bind="$attrs"
    :class="{ 'is-error': isError }"
    style="--el-input-border-radius: 8px"
    :placeholder="$t('base.input_placeholder')"
    @blur="handleValidate"
    :prefix-icon="search ? SearchComp : ''"
    autocomplete="off"
  />
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus';
import { omit } from 'lodash-es';
import { PropType, defineComponent, h } from 'vue';
import { ref } from 'vue';
import XIcon from '../icon';
defineOptions({ name: 'XInput' });

const props = defineProps({
  label: String,
  readonly: Boolean,
  validate: {
    type: Function as PropType<(value: any) => boolean>
  },
  search: Boolean
});

const SearchComp = defineComponent({
  setup() {
    return () =>
      h(XIcon, {
        name: 'icon-park-outline:search',
        color: 'var(--x-text-second-color)'
      });
  }
});

const isError = ref(false);

function handleValidate() {
  setTimeout(() => {
    isError.value =
      props.validate === undefined ? false : !props.validate?.(text);
  }, 0);
}

const text = defineModel<string, string>();
const focused = ref(false);

const inputRef = ref<InstanceType<typeof ElInput> | null>(null);
defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<style scoped lang="scss">
.x-input {
  :deep(.el-input__wrapper) {
    padding: 0;
    box-shadow: none;
  }

  :deep(textarea) {
    padding: 4px 0 0;
    box-shadow: none;
  }

  &:has(.el-textarea) {
    padding-bottom: 8px;
  }
}

.is-error {
  --el-input-border-color: var(--el-color-error);
  --el-input-focus-border-color: var(--el-color-error);
  --el-input-hover-border-color: var(--el-color-error);
}
</style>
