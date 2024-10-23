import { MaybeRef } from '@vueuse/core';
import { type ElScrollbar } from 'element-plus';
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export const useScrollbar = () => {
  const el = ref<typeof ElScrollbar>();
  // 初始化时更新一次
  nextTick(() => {
    updateScrollBar();
  });
  // 切换路由时更新一次
  const { currentRoute } = useRouter();
  watch(currentRoute, () => {
    nextTick(() => {
      updateScrollBar();
    });
  });

  function update() {
    el?.value?.update();
  }

  function updateScrollBar(delta = 500) {
    let startTime = 0;
    function loop() {
      const currentTime = performance.now();
      if (currentTime - startTime > delta) {
        update();
        return;
      }
      update();
      requestAnimationFrame(loop);
    }

    startTime = performance.now();
    requestAnimationFrame(loop);
  }

  return {
    /**
     * element-plus 的虚拟滚动条组件实例
     */
    scrollbarRef: el as MaybeRef<typeof ElScrollbar>,

    /**
     * 动态更新 element-plus 的虚拟滚动条组件大小
     *
     * @description 解决 element-plus 滚动条不能动态更新的问题
     *
     * @param delta 持续时长，单位ms，默认 500ms
     */
    updateScrollBar
  };
};
