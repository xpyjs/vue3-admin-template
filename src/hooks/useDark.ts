import { useColorMode } from '@vueuse/core';
import CacheKey from '@/config/cacheKeys';
import { computed } from 'vue';

export const useDark = () => {
  const mode = useColorMode({
    emitAuto: true,
    storageKey: CacheKey.ACTIVE_COLOR_SCHEME,
    disableTransition: false,
    initialValue: 'light'
  });

  return {
    isDark: computed(
      () =>
        (mode.store.value === 'auto' ? mode.system.value : mode.store.value) ===
        'dark'
    ),
    mode
  };
};
