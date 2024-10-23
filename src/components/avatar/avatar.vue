<template>
  <div
    class="x-avatar inline-flex"
    :style="{ '--avatar-size': `${avatarSize}px` }"
  >
    <el-avatar
      v-for="(item, index) in list.slice(0, maxShowCount)"
      :shape="shape"
      :size="avatarSize"
      class="x-avatar-item rounded-8px b-1px b-white b-solid box-border shrink-0"
      :class="[{ '!b-0': list.length === 1 }]"
      :src="item.url"
    >
      {{ item.name?.[0] || '' }}
    </el-avatar>
    <el-avatar
      v-if="list.length > maxShowCount"
      :shape="shape"
      :size="avatarSize"
      class="x-avatar-item rounded-8px b-1px b-white b-solid box-border shrink-0"
    >
      {{ list.length - maxShowCount }}+
    </el-avatar>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue';

defineOptions({ name: 'XAvatar' });

const props = defineProps({
  size: {
    type: [String, Number],
    default: 'medium'
  },
  shape: {
    type: String,
    default: 'square'
  },
  /**
   * @description  展示的个数
   */
  showCount: {
    type: [String, Number],
    default: 5
  },
  /**
   * @description  头像列表
   * @param {string} url 头像图片地址
   * @param {string} name 头像名称。这可以让头像在无法显示时，显示其第一个字
   */
  list: {
    type: Array as PropType<
      { url?: string; name?: string; [key: string]: any }[]
    >,
    default: () => []
  }
});

const maxShowCount = computed(() => parseInt(`${props.showCount}`));

const avatarSize = computed(() => {
  if (typeof props.size === 'number' || /^\d+$/.test(props.size))
    return parseInt(`${props.size}`);

  switch (props.size) {
    case 'large':
      return 40;
    case 'small':
      return 12;
    default:
    case 'medium':
      return 28;
  }
});
</script>

<style scoped lang="scss">
.x-avatar {
  .x-avatar-item + .x-avatar-item {
    margin-left: calc(var(--avatar-size) / 3 * -1);
  }

  .x-avatar-item {
    font-size: max(12px, calc(var(--avatar-size) / 2));
  }
}
</style>
