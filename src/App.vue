<template>
  <el-config-provider :locale="elementPlusLang">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/hooks/useTheme';
import { useLang } from '@/hooks/useI18n';
import { useRouter } from 'vue-router';
import { useDrawer } from './components/drawer/useDrawer';
import { watch } from 'vue';

// /** 初始化主题 */
const { initTheme } = useTheme();
initTheme();

// /** 初始化语言 */
const { initLang, elementPlusLang } = useLang();
initLang();

// /** 监听侧边栏 */
const { currentRoute } = useRouter();
const { close } = useDrawer();
watch(currentRoute, () => close());
</script>
