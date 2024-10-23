<template>
  <el-button
    :class="['XButton', { '!ba': isDark && primary }]"
    :dark="isDark"
    style="--el-border-radius-base: 8px"
    :color="color"
    v-bind="$attrs"
  >
    <slot />
  </el-button>
</template>

<script lang="ts" setup>
import { useDark } from '@/hooks/useDark';
import { useTheme } from '@/hooks/useTheme';
import { computed } from 'vue';
defineOptions({ name: 'XButton' });

const props = defineProps({
  /**
   * 使用主色调
   */
  primary: Boolean,
  /**
   * 特殊颜色处理。当设置为 true 时，在亮色模式下，应用主色会呈现黑色；而在暗色模式下，应用主色是其本身颜色
   */
  special: Boolean,
  /**
   * 自定义亮色颜色，在亮色模式下应用其颜色。优先级最高
   */
  color: String,
  /**
   * 自定义暗色颜色，在暗色模式下应用其颜色。优先级最高
   */
  darkColor: String
});

const { isDark } = useDark();
const { primaryColor } = useTheme();

const color = computed(() => {
  if (props.color || props.darkColor) {
    return (isDark.value ? props.darkColor : props.color) || props.color;
  } else if (props.primary) {
    return isDark.value
      ? primaryColor.value
      : props.special
        ? '#000'
        : primaryColor.value;
  }

  // return isDark.value ? '#323232' : '#f3f3f3';
});
</script>

<style lang="scss"></style>
