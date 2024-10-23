<template>
  <div
    class="XLayout w-full h-full relative flex flex-nowrap"
    :class="[{ 'drawer-inline': !appStore.drawerOverlay }]"
    :style="{
      '--el-overlay-color-lighter': appStore.drawerOverlay
        ? 'rgba(0, 0, 0, 0.5)'
        : 'transparent'
    }"
  >
    <!-- 左侧菜单 -->
    <aside
      :class="[
        'h-full flex flex-col ts-width-.2 flex-shrink-0 box-border br bg-[var(--x-bg-color)]',
        { 'w-[var(--menu-min-width)]': appStore.isCollapse },
        { 'w-[var(--menu-max-width)]': !appStore.isCollapse }
      ]"
    >
      <div
        class="relative shrink-0 w-100% h-[var(--nav-height)] flex items-center pl-26px pr-20px box-border cursor-pointer"
        @click="push('/user/profile')"
      >
        <XPersonal />
      </div>

      <XMenu
        class="flex-1 overflow-hidden box-border mt-12px"
        :menu-list="routesStore.allRoutes"
      />

      <div
        class="w-full flex items-center justify-center mb-28px left-bottom-logo"
      >
        <XIcon name="emojione:owl" size="82" />
      </div>
    </aside>

    <!-- 右侧 -->
    <main
      :class="[
        'relative h-full ts-all-.3 flex flex-col bg-[var(--x-bg-color)]'
      ]"
      :style="{
        width: `calc(100% - ${appStore.isCollapse ? 'var(--menu-min-width)' : 'var(--menu-max-width)'} - ${!appStore.drawerOverlay && drawerHooks.showDrawer.value ? drawerHooks.width.value : '0px'})`
      }"
    >
      <!-- 顶部导航 -->
      <header
        class="w-full h-[var(--nav-height)] bg-[var(--x-bg-color)] bb box-border px-26px flex items-center justify-between"
      >
        <div class="flex items-center">
          <XIcon
            :name="
              appStore.isCollapse
                ? 'tabler:layout-sidebar-left-expand'
                : 'tabler:layout-sidebar-left-collapse'
            "
            size="20"
            class="cursor-pointer pr-16px"
            @click="
              () => {
                appStore.toggleCollapse();
              }
            "
          />
          <XBreadcrumb />
        </div>

        <div class="flex items-center">
          <!-- <div>operation</div> -->
          <XSwitchTheme />
          <XSwitchMode />

          <XIcon
            name="ic:baseline-logout"
            size="18"
            class="cursor-pointer ml-16px"
            @click="
              () => {
                push('/logout');
              }
            "
          />
        </div>
      </header>

      <!-- 缓存导航 -->
      <XTagsView />

      <!-- 内容区域 -->
      <ElScrollbar height="100%" tag="section">
        <router-view>
          <template #default="{ Component, route }">
            <KeepAlive :include="cachedViews">
              <component
                v-if="!route.meta.link"
                :is="Component"
                :key="route.fullPath"
              />
            </KeepAlive>
          </template>
        </router-view>
      </ElScrollbar>

      <footer
        class="py-8px w-full bt text-center text-[var(--x-text-second-color)]"
      >
        <span class="text-12px mr-4px">&COPY;CopyRight</span>
        <a
          href="https://www.xiaopangying.com"
          target="_blank"
          class="text-12px x-link"
        >
          XiaoPangYing.COM
        </a>
        <span class="text-12px ml-4px">2020-present</span>
      </footer>
    </main>

    <component
      :is="drawerHooks.drawerSlot.value"
      :class="[
        'h-full',
        {
          ' !shadow-none pointer-events-auto': !appStore.drawerOverlay
        }
      ]"
      :size="drawerHooks.width.value"
    />
  </div>
</template>

<script setup lang="ts">
import { useDrawer } from '@/components/drawer/useDrawer';
import XIcon from '@/components/icon';
import { useAppStore } from '@/store/modules/app';
import { useRoutesStore } from '@/store/modules/routes';
import XMenu from './components/menu/Menu.vue';
import XPersonal from './components/personal/index.vue';
import XBreadcrumb from './components/breadcrumb/index.vue';
import XSwitchMode from './components/switchMode/index.vue';
import XSwitchTheme from './components/switchTheme/index.vue';
import XTagsView from './components/tagsView/index.vue';
import { useRouter } from 'vue-router';
import { useTagsViewStore } from '@/store/modules/tags-view';
import { watch, watchEffect } from 'vue';

defineOptions({ name: 'XLayout' });

const appStore = useAppStore();
const routesStore = useRoutesStore();
const { push } = useRouter();

const drawerHooks = useDrawer();

watchEffect(() => {
  console.log('drawerHooks.width.value', drawerHooks.width.value);
});

const { cachedViews } = useTagsViewStore();
</script>

<style scoped lang="scss">
.XLayout.drawer-inline {
  :deep(.el-overlay) {
    transition: all 0.3s;
    transition-delay: 0 !important;
    position: absolute;
    pointer-events: none;
    background: none !important;
    backdrop-filter: none !important;
  }

  :deep(.el-drawer) {
    border-left: 1px solid var(--x-border-color);
  }
}

:deep(.el-drawer) {
  border-left-color: transparent;
}

@media (max-height: 800px) {
  .left-bottom-logo {
    display: none;
  }
}
</style>
