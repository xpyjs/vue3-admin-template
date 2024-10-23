import { MaybeComputedElementRef } from '@vueuse/core';
import { toRef } from 'vue';
import { useI18n } from '@/hooks/useI18n';

const MAP = new WeakMap();

const ID = 'x-empty-el';

function setEmpty(el: MaybeComputedElementRef, value: boolean) {
  const element = toRef<HTMLElement>(el as any);
  const parentEl = element.value?.parentNode;

  if (!parentEl) {
    return;
  }

  // 清空所有 id 的元素
  parentEl.querySelectorAll(`#${ID}`).forEach(el => parentEl.removeChild(el));

  if (value) {
    // 挂载一个空提示
    const emptyEl = document.createElement('div');
    emptyEl.style.display = 'flex';
    emptyEl.style.width = '100%';
    emptyEl.style.height = '100%';
    emptyEl.style.flex = '1';
    emptyEl.style.justifyContent = 'center';
    emptyEl.style.alignItems = 'center';
    emptyEl.style.color = 'var(--x-text-second-color)';
    emptyEl.innerText = useI18n().t('base.empty');
    emptyEl.id = 'x-empty-el';

    // 缓存 display
    MAP.set(element, element.value.style.display);
    element.value.style.display = 'none';

    parentEl.appendChild(emptyEl);
  } else {
    element.value.style.display = MAP.get(element) || 'block';

    const emptyEl = parentEl.querySelector(`#${ID}`);
    emptyEl && parentEl.removeChild(emptyEl);
  }
}

export default {
  mounted(el: any, binding: any) {
    const { value } = binding;

    setEmpty(el, value);
  },

  updated(el: any, binding: any) {
    const { value } = binding;

    setEmpty(el, value);
  }
};
