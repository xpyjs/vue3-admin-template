import { createI18n } from 'vue-i18n';
import { useAppStoreOutside } from '@/store/modules/app';

const appStore = useAppStoreOutside();

/**
 * 动态导入语言包
 *
 * @description 将所有语言包放在 src/i18n/locales 文件夹下，通过 vite 的 glob 功能动态导入。语言包名称与导入语言相同，标准字符：大小写字母+数字+下划线+横线
 *
 * @params 为保证语言列表可以正确显示，需要在每个语言包中添加 `__name__` 字段，用于显示语言名称
 */
const importLanguagePkg = () => {
  const locales: Record<string, any> = import.meta.glob('./locales/*.json', {
    eager: true
  });
  const messages: Record<string, any> = {};
  for (const path in locales) {
    const matched = path.match(/([a-zA-Z0-9_\-]+)\.json$/i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = { ...locales[path].default };
    }
  }
  return messages;
};

const messages = importLanguagePkg();

const i18n = createI18n({
  legacy: false, // 如果想在composition api中使用需要设置为false
  locale: appStore.language,
  messages,
  globalInjection: true // 如果设置true, $t() 函数将注册到全局
});

/**
 * 语言列表
 */
export const langList = Object.keys(messages).map(lang => {
  return {
    label: (messages[lang].__name__ as string) || lang,
    value: lang
  };
});

export default i18n;
