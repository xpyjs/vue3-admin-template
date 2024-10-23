import { defineStore } from 'pinia';
import { ref } from 'vue';
import store from '../index';

export const useAppStore = defineStore('app', () => {
  const isCollapse = ref(false);
  const drawerOverlay = ref(false);
  const language = ref<LangName>('zh-CN');

  return {
    language,
    setLanguage(lang: LangName) {
      language.value = lang;
    },

    isCollapse,
    toggleCollapse() {
      isCollapse.value = !isCollapse.value;
    },

    drawerOverlay,
    toggleDrawerOverlay() {
      drawerOverlay.value = !drawerOverlay.value;
    }
  };
});

export const useAppStoreOutside = () => {
  return useAppStore(store);
};
