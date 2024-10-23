<template>
  <section class="w-full bg-[var(--x-bg-color)] bb">
    <el-scrollbar
      view-class="flex items-center gap-2 box-border px-12px py-6px"
      ref="scrollbarRef"
    >
      <TransitionGroup :name="transitionName" class="relative">
        <router-link
          v-for="(item, index) in tagsViewStore.visitedViews"
          :key="item.fullPath"
          :to="item"
          :style="{ '--i': index }"
        >
          <XContextMenu
            trigger="contextmenu"
            :menu="[
              {
                label: $t('btn.tags.refresh'),
                command: () => {
                  tagsViewStore.removeCachedView(item);
                  replace(`/redirect${item.fullPath}`);
                }
              },
              {
                label: $t('btn.tags.close_current'),
                command: () => {
                  handleClose(item);
                }
              },
              {
                label: $t('btn.tags.close_other'),
                command: () => {
                  if (currentRoute.fullPath !== item.fullPath) {
                    push(item);
                  }
                  tagsViewStore.removeOtherVisitedView(item);
                }
              },
              {
                label: $t('btn.tags.close_all'),
                command: () => {
                  tagsViewStore.removeAllVisitedView();
                  toValid();
                }
              }
            ]"
          >
            <el-tag
              :hit="item.fullPath === currentRoute.fullPath"
              :disable-transitions="item.meta?.affix"
              :closable="!item.meta?.affix"
              @close.prevent.stop="handleClose(item)"
            >
              {{ item.meta?.title }}
            </el-tag>
          </XContextMenu>
        </router-link>
      </TransitionGroup>

      <!-- 右侧空白占位 -->
      <div class="relative shrink-0 w-12px h-10px"></div>
    </el-scrollbar>
  </section>
</template>

<script setup lang="ts">
import XContextMenu from '@/components/contextMenu';
import { useRouteListener } from '@/hooks/useRouteListener';
import { useScrollbar } from '@/hooks/useScrollbar';
import { useRoutesStore } from '@/store/modules/routes';
import { useTagsViewStore } from '@/store/modules/tags-view';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const { scrollbarRef } = useScrollbar();

const { currentRoute, replace, push } = useRouter();
const transitionName = ref('tags-view');
watch(currentRoute, () => {
  if (currentRoute.value.meta?.affix) {
    transitionName.value = '';
  } else {
    transitionName.value = 'tags-view';
  }
});

function getAffixTags(routes: AppRouteConfig[] = []) {
  const tags: AppRouteConfig[] = [];
  routes.forEach(route => {
    if (route.meta?.affix) {
      tags.push(route);
    }

    if (route.children && route.children.length > 0) {
      tags.push(...getAffixTags(route.children));
    }
  });

  return tags;
}

const { allRoutes } = useRoutesStore();
const { listenerRouteChange } = useRouteListener();
const tagsViewStore = useTagsViewStore();
onMounted(() => {
  // 初始化首先加载固定标签
  const affixTags = getAffixTags(allRoutes);
  affixTags.forEach(route => {
    tagsViewStore.addVisitedView(route);
  });

  listenerRouteChange(async route => {
    tagsViewStore.addVisitedView(route);
  }, true);
});

function handleClose(item: AppRouteConfig) {
  // 移除缓存
  tagsViewStore.removeVisitedView(item);

  // 如果当前关闭的是当前路由，则跳转到最后一个路由
  if (currentRoute.value.path === item.path) {
    toValid();
  }
}

function toValid() {
  // 当前路由如果固定有效，直接返回
  if (currentRoute.value.meta?.affix) return;

  // 跳转到最后一个路由
  const lastRoute = tagsViewStore.visitedViews.slice(-1)[0];
  if (lastRoute) {
    push(lastRoute);
  } else {
    // 全部关闭了，跳转到首页
    push('/');
  }
}
</script>

<style scoped lang="scss">
.tags-view-move,
.tags-view-enter-active,
.tags-view-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.tags-view-enter-from,
.tags-view-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translateX(calc(var(--i) * 100px));
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.tags-view-leave-active {
  position: absolute;
}
</style>
