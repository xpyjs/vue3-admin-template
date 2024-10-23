<template>
  <div class="XMenu">
    <ElScrollbar
      view-class="h-full w-full px-20px box-border"
      ref="scrollbarRef"
    >
      <ElMenu
        class="h-full !w-full !b-r-0"
        popper-class="XMenu__popper"
        style="
          --el-menu-bg-color: var(--x-bg-menu-color);
          --el-menu-base-level-padding: 12px;
        "
        :default-active="activeMenu"
        :collapse="appStore.isCollapse"
        @open="() => updateScrollBar()"
        @close="() => updateScrollBar()"
      >
        <template v-for="m in renderedMenuList">
          <MenuItem :menu="m" />
        </template>
      </ElMenu>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, unref, ref, PropType, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { cloneDeep } from 'lodash-es';
import MenuItem from './MenuItem.vue';
import { useScrollbar } from '@/hooks/useScrollbar';
defineOptions({ name: 'XMenu' });

const { scrollbarRef, updateScrollBar } = useScrollbar();

const props = defineProps({
  menuList: {
    type: Array as PropType<AppRouteConfig[]>,
    default: () => []
  }
});

const appStore = useAppStore();

const renderedMenuList = ref<AppRouteConfig[]>([]);
// 处理菜单
watchEffect(() => {
  const menuList = cloneDeep(props.menuList);
  const list: AppRouteConfig[] = [];
  menuList.forEach(item => {
    // 如果子项只有一个，且是一个菜单，并且不是隐藏的，则将子项提升到父级
    if (
      item.children?.length === 1 &&
      !item.meta?.hidden &&
      !item.children[0].meta?.hidden &&
      !item.children[0].children?.length
    ) {
      list.push(item.children[0]);
      delete item.children;
    } else if (!item.meta?.hidden) {
      list.push(item);
    }
  });
  renderedMenuList.value = list;
});

const { currentRoute } = useRouter();
const activeMenu = computed(() => {
  const { meta, path } = unref(currentRoute);
  if (meta.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});
</script>

<style lang="scss">
// 折叠动画的时候，就需要把文字给隐藏掉
.horizontal-collapse-transition {
  span {
    display: none;
  }
}

.el-menu--vertical:not(.XMenu__popper) {
  .el-sub-menu__title {
    border-radius: 12px;

    &:hover {
      color: var(--x-color-primary);
    }

    .el-sub-menu__icon-arrow {
      color: var(--x-text-second-color);
    }
  }

  .el-menu-item {
    border-radius: 12px;

    &.is-active {
      background-color: var(--x-menu-active-bg-color);

      a {
        color: var(--x-color-primary) !important;
      }
    }
  }
}
</style>
