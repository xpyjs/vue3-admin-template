<template>
  <ElSubMenu v-if="menu.children?.length" :index="menu.fullPath">
    <template #title>
      <XIcon v-if="menu.meta?.icon" :name="menu.meta.icon" class="mr-2" />
      <span>{{ menu.meta?.title || menu.name }}</span>
    </template>
    <template v-for="m in menu.children">
      <MenuItem :menu="m" />
    </template>
  </ElSubMenu>

  <ElMenuItem v-else-if="menu.fullPath" :index="menu.fullPath" class="group">
    <a
      v-if="isLink(menu)"
      :href="menu.fullPath"
      target="_blank"
      class="flex items-center decoration-none text-[var(--x-text-color)] hover:text-[var(--x-color-primary)] text-ellipsis overflow-hidden group-hover:pl-2px ts-all-.3"
    >
      <span>{{ menu.meta?.title || menu.name }}</span>
      <XIcon
        name="line-md:external-link"
        size="12"
        color="var(--x-text-second-color)"
        class="ml-4px"
      />
    </a>

    <router-link
      v-else
      :to="menu.fullPath"
      class="w-full decoration-none text-[var(--x-text-color)] hover:text-[var(--x-color-primary)] text-ellipsis overflow-hidden group-hover:pl-2px ts-all-.3 flex items-center"
    >
      <XIcon v-if="menu.meta?.icon" :name="menu.meta.icon" class="mr-2" />
      {{ menu.meta?.title || menu.name }}
    </router-link>
  </ElMenuItem>
</template>

<script setup lang="ts">
import XIcon from '@/components/icon';
import { PropType } from 'vue';

defineProps({
  menu: {
    type: Object as PropType<AppRouteConfig>,
    required: true
  }
});

function isLink(item: AppRouteConfig) {
  return item.fullPath && /^https?:\/\//.test(item.fullPath);
}
</script>
