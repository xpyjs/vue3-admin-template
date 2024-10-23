<template>
  <XDialog :title="$t('page.profile.change_pwd_title')" width="550">
    <div
      class="mt-28px w-full rounded-16px bg-[var(--x-bg-color)] p-28px box-border flex flex-col"
    >
      <XInput
        v-model="currentPwd"
        :placeholder="$t('page.profile.change_pwd_current_placeholder')"
        type="password"
        class="h-48px"
      />

      <XSetPassword v-model="pwd" class="mt-28px" />
    </div>

    <template v-slot:footer="{ close }">
      <XButton primary :disabled="!pwd" @click="() => onSubmit(close)">
        {{ $t('btn.confirm') }}
      </XButton>
      <XButton @click="close">
        {{ $t('btn.cancel') }}
      </XButton>
    </template>
  </XDialog>
</template>

<script setup lang="ts">
import XButton from '@/components/button';
import XDialog from '@/components/dialog';
import XInput from '@/components/input';
import useMessage from '@/hooks/useMessage';
import XSetPassword from '@/components/setPassword';
import { ref } from 'vue';
import { updateUserPwd } from '@/api/system/user';
defineOptions({ name: 'ChangePwdDialog' });

const currentPwd = ref('');
const pwd = ref('');

const onSubmit = (close: () => void) => {
  updateUserPwd(currentPwd.value, pwd.value).then(res => {
    if (res.code === 200) {
      useMessage('page.profile.change_pwd_success');
      close();
    }
  });
};
</script>
