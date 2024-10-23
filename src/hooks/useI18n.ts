import { computed, ref, watchEffect } from 'vue';
import {
  getActiveLangName,
  setActiveLangName
} from '@/utils/cache/local-storage';
import { useAppStore } from '@/store/modules/app';
import { useI18n as useVueI18n } from 'vue-i18n';
import i18n, { langList } from '../i18n';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

// TODO 如果需要使用多语言，需要在此处添加语言包

const DEFAULT_LANG_NAME = 'zh-CN';

/** Element Plus 语言集合 */
const elementPlusLangs: Record<LangName, any> = {
  'zh-CN': zhCn,
  en
};

/** 正在应用的语言名称 */
const activeLangName = ref<LangName>(getActiveLangName() || DEFAULT_LANG_NAME);

/** 初始化 */
const initLang = () => {
  const { setLanguage } = useAppStore();
  const { locale } = useVueI18n();

  // watchEffect 来收集副作用
  watchEffect(() => {
    const value = activeLangName.value ?? DEFAULT_LANG_NAME;
    setActiveLangName(value);
    // 设置 i18n 的语言。可以添加映射对象，如 { 'zh-CN': 'zh' }
    locale.value = value;
    setLanguage(value);
  });
};

/** 语言 hook */
export function useLang() {
  return {
    langList,
    activeLangName,
    initLang,
    elementPlusLang: computed(() => elementPlusLangs[activeLangName.value]),
    setLang: (value: LangName) => {
      activeLangName.value = value;
    }
  };
}

export function useI18n() {
  return i18n.global;
}
