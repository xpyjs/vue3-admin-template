<template>
  <i
    :style="iconStyle"
    class="x-icon text-1em h-1em line-height-1em inline-flex justify-center items-center relative fill-current"
  >
    <!-- 自定义图片格式优先级最高 -->
    <img
      v-if="props.url"
      :src="props.url"
      alt="custom icon"
      :style="{
        ...iconStyle,
        width: iconSize(props.size),
        height: iconSize(props.size)
      }"
      crossorigin="anonymous"
    />

    <!-- 其次是本地 -->
    <svg
      v-else-if="isLocal"
      aria-hidden="true"
      class="fill-current w-1em h-1em"
    >
      <use :xlink:href="symbolId" />
    </svg>

    <!-- 内置图标 -->
    <Icon v-else :icon="props.name" :style="iconStyle" />
  </i>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';
import { Icon } from '@iconify/vue';

defineOptions({ name: 'XIcon' });

const props = defineProps({
  /**
   * 图标名称
   */
  name: { type: String, default: '' },
  /**
   * 图标颜色
   */
  color: { type: String, default: 'var(--x-text-color)' },
  /**
   * 图标大小
   */
  size: { type: [Number, String] },
  /**
   * 自定义图标的前缀
   */
  prefix: { type: String, default: 'svg-icon' },
  /**
   * 自定义图标的路径。使用路径后，name 属性将失效，如果是图片格式，color 也可能会失效
   */
  url: { type: String }
});

// 本地 svg 图标
const pf = props.prefix ?? 'svg-icon';
const isLocal = computed(() => props.name.startsWith(`${pf}:`));
const symbolId = computed(() =>
  unref(isLocal) ? `#icon-${props.name.split(`${pf}:`)[1]}` : props.name
);

const iconSize = (size?: string | number) => {
  return size === undefined
    ? '1em'
    : /^\d+$/.test(`${size}`)
      ? `${size}px`
      : size;
};

const iconStyle = computed(() => {
  const { color, size } = props;
  return {
    fontSize: iconSize(size),
    color
  };
});
</script>

<style scoped lang="scss">
.x-icon {
  & + .x-icon {
    margin-left: 12px;
  }
}
</style>
