<template>
  <div class="flex flex-col w-full h-full box-border p-24px">
    <div class="w-full flex items-center">
      <XUpload
        :url="''"
        v-model="userInfo.avatar"
        :name="userInfo.nickName"
        :show-clear="false"
        shape="circle"
        class="!w-60px !h-60px"
        :size="60"
      />

      <div class="flex flex-col ml-16px">
        <div class="text-5 font-bold">{{ userInfo.nickName }}</div>
        <div class="text-4">{{ userInfo.email }}</div>
      </div>
    </div>

    <div
      class="mt-24px w-full flex items-center justify-between box-border p-12px rounded-8px ts-all-.1 hover:bg-[var(--x-bg-second-color)] cursor-pointer"
      @click="
        () => {
          // showChangeNameDialog = true;
        }
      "
    >
      <div class="text-4">{{ $t('page.profile.name') }}</div>

      <div class="flex items-center">
        <span class="text-[var(--x-text-second-color)]">{{
          userInfo.nickName
        }}</span>
        <XIcon
          name="svg-icon:base-right"
          class="pl-16px"
          color="var(--x-right-icon-color)"
        />
      </div>
    </div>

    <el-divider />

    <div class="text-5 lh-normal font-600 mb-12px px-12px">
      {{ $t('page.profile.account_safe') }}
    </div>
    <div
      class="w-full flex items-center justify-between box-border p-12px rounded-8px ts-all-.1 hover:bg-[var(--x-bg-second-color)] cursor-pointer"
      @click="
        () => {
          // showChangeEmailDialog = true;
        }
      "
    >
      <div class="text-4">{{ $t('page.profile.email') }}</div>

      <div class="flex items-center">
        <span class="text-[var(--x-text-second-color)]">{{
          userInfo.email
        }}</span>
        <XIcon
          name="svg-icon:base-right"
          class="pl-16px"
          color="var(--x-right-icon-color)"
        />
      </div>
    </div>

    <div
      class="w-full flex items-center justify-between box-border p-12px rounded-8px ts-all-.1 hover:bg-[var(--x-bg-second-color)] cursor-pointer"
      @click="
        () => {
          showChangePwdDialog = true;
        }
      "
    >
      <div class="flex flex-col">
        <div class="text-4 lh-normal">{{ $t('page.profile.password') }}</div>
        <div class="text-3.6 lh-normal text-[var(--x-text-second-color)]">
          {{ $t('page.profile.set_pwd') }}
        </div>
      </div>

      <div class="flex items-center">
        <XIcon
          name="svg-icon:base-right"
          class="pl-16px"
          color="var(--x-right-icon-color)"
        />
      </div>
    </div>
  </div>

  <ChangePwdDialog v-model:visible="showChangePwdDialog" />
</template>

<script lang="ts" setup>
import { getUserProfile, updateUserProfile } from '@/api/system/user';
import XIcon from '@/components/icon';
import { ref } from 'vue';
import ChangePwdDialog from './changePwd.vue';
import XUpload from '@/components/upload';

const userInfo = ref<Partial<ISysUser>>({});
getUserProfile().then(res => {
  userInfo.value = res.data;
});

function updateUserInfo(data: Record<string, any>) {
  return updateUserProfile((userInfo.value = { ...userInfo.value, ...data }));
}

const showChangePwdDialog = ref(false);
</script>
