<template>
  <div class="w-full h-fit">
    <XInput
      v-model="code"
      class="h-48px !rounded-16px"
      type="password"
      show-password
      style="--el-input-bg-color: var(--x-bg-placeholder-color)"
      :placeholder="$t('page.register.set_pwd_placeholder')"
    />

    <div class="flex space-x-8px w-full mt-8px">
      <el-progress
        class="w-full h-4px"
        :show-text="false"
        :percentage="strong > 0 ? 100 : 0"
        status="exception"
      />
      <el-progress
        class="w-full h-4px"
        :show-text="false"
        :percentage="strong > 1 ? 100 : 0"
        status="warning"
      />
      <el-progress
        class="w-full h-4px"
        :show-text="false"
        :percentage="strong > 2 ? 100 : 0"
        status="success"
      />
      <el-progress
        class="w-full h-4px"
        :show-text="false"
        :percentage="strong > 3 ? 100 : 0"
        color="green"
      />
    </div>

    <div
      class="text-[var(--x-text-second-color)] self-start text-3.6 lh-normal mt-12px"
    >
      {{ $t('page.register.pwd_strong_tip') }}
    </div>

    <XInput
      v-model="confirmCode"
      class="h-48px !rounded-16px mt-24px"
      type="password"
      show-password
      :validate="() => confirmCode === code"
      style="--el-input-bg-color: var(--x-bg-placeholder-color)"
      :placeholder="$t('page.register.confirm_pwd_placeholder')"
    />
  </div>
</template>

<script setup lang="ts">
import XInput from '@/components/input';
import useMessage from '@/hooks/useMessage';
import { ref, watch } from 'vue';

const props = defineProps({ modelValue: String });

const code = ref('');
const confirmCode = ref('');
const strong = ref(0);

const emit = defineEmits(['update:modelValue']);
watch(
  () => [code.value, confirmCode.value],
  () => {
    // 判断 code.value 的强度。它分为 1、2、3、4 四个档位，分别对应 简单、普通、强、超强
    if (code.value.length >= 8) {
      const hasLowercase = /[a-z]/.test(code.value);
      const hasUppercase = /[A-Z]/.test(code.value);
      const hasNumbers = /\d/.test(code.value);
      const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(code.value);

      const conditionsMet = [
        hasLowercase,
        hasUppercase,
        hasNumbers,
        hasSymbols
      ].filter(Boolean).length;

      switch (conditionsMet) {
        case 1:
          strong.value = 1; // 简单
          break;
        case 2:
          strong.value = 2; // 普通
          break;
        case 3:
          strong.value = 3; // 强
          break;
        case 4:
          strong.value = 4; // 超强
          break;
        default:
          strong.value = 0; // 不满足基本条件
      }
    } else {
      strong.value = 0; // 不满足长度要求
    }

    if (validate(false)) {
      emit('update:modelValue', code.value);
    } else {
      emit('update:modelValue', '');
    }
  }
);

function validate(showMessage = true) {
  if (code.value.length < 8) {
    showMessage && useMessage('page.register.pwd_len_8');
    return false;
  }

  if (strong.value === 0) {
    showMessage && useMessage('page.register.pwd_not_strong');
    return false;
  }

  if (confirmCode.value !== code.value) {
    showMessage && useMessage('page.register.pwd_not_match');
    return false;
  }

  return true;
}
</script>

<style scoped></style>
