<template>
  <XIcon :url="userStore.userInfo?.avatar || Avatar" size="28" class="mr-8px" />
  <div class="text-16px text-nowrap" v-if="!appStore.isCollapse">
    {{ userStore.userInfo.nickName }}
  </div>
</template>

<script setup lang="ts">
import XIcon from '@/components/icon';
import useUserStore from '@/store/modules/user';
import Avatar from '@/assets/images/xpy.png';
import { useAppStore } from '@/store/modules/app';

const userStore = useUserStore();
const appStore = useAppStore();
</script>
