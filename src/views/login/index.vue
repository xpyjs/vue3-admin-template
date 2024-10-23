<template>
  <div class="h-100% flex items-center">
    <div
      class="w-680px h-700px rounded-32px bg-[var(--x-bg-color)] mx-auto p-24px box-border flex flex-col"
    >
      <div
        class="box-border w-313px mx-auto flex flex-col items-center justify-center gap-16px flex-1"
      >
        <XIcon :url="logoImg" size="140" class="!h-100px" />

        <div class="text-[var(--x-text-color)] text-6.85 lh-normal font-bold">
          {{ $t('page.login.login') }}
        </div>

        <XInput
          v-model.trim="loginParams.username"
          auto-complete="off"
          class="h-48px !rounded-16px"
          style="--el-input-bg-color: var(--x-bg-second-color)"
          :placeholder="$t('page.login.username_placeholder')"
        />

        <XInput
          v-model.trim="loginParams.password"
          auto-complete="off"
          class="h-48px !rounded-16px"
          style="--el-input-bg-color: var(--x-bg-second-color)"
          type="password"
          :placeholder="$t('page.login.password_placeholder')"
        />

        <div class="flex items-center mt-4">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />

          <XInput
            v-model="loginParams.code"
            auto-complete="off"
            class="h-48px !rounded-16px ml-4"
            placeholder="验证码"
          >
          </XInput>
        </div>

        <XButton
          v-loading="loading"
          primary
          class="w-full !h-48px !rounded-16px mt-8"
          @click="handleLogin"
        >
          {{ $t('page.login.login') }}
        </XButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useUserStore from '@/store/modules/user';
import useMessage from '@/hooks/useMessage';
import XInput from '@/components/input';
import XIcon from '@/components/icon';
import logoImg from '@/assets/images/xpy.png';
import { getCodeImg } from '@/api/login';
import XButton from '@/components/button';

const loginParams = ref({
  username: '',
  password: '',
  code: '',
  uuid: ''
});

const loading = ref(false);
const { push, currentRoute } = useRouter();
const { login } = useUserStore();
const handleLogin = () => {
  loading.value = true;
  login(loginParams.value)
    .then(() => {
      // 登录后，检查是否包含重定向，如果有则跳转到重定向页面
      const to = currentRoute.value.query.redirect as string;
      if (to) {
        push({ path: `/redirect/${to}`, query: { from: 'login' } });
      } else {
        push('/');
      }
      useMessage('messages.login_success');
    })
    .catch(() => {
      getCode();
      loginParams.value.code = '';
    })
    .finally(() => {
      loading.value = false;
    });
};

const captchaEnabled = ref(true);
const codeUrl = ref('');

const getCode = () =>
  getCodeImg().then((res: any) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img;
      loginParams.value.uuid = res.uuid;
    }
  });
getCode();
</script>

<style scoped></style>
