<template>
  <el-switch
    class="XSwitchTheme"
    :model-value="isDark"
    @change="onChange"
    @click.capture="onClick"
  >
    <template #active-action>🌙</template>
    <template #inactive-action>🌞</template>
  </el-switch>
</template>

<script setup lang="ts">
import { useDark } from '@/hooks/useDark';
import { ref } from 'vue';

const { isDark, mode } = useDark();

const pos = ref({ x: 0, y: 0 });
function onClick(e: MouseEvent) {
  pos.value = { x: e.clientX, y: e.clientY };
}

function onChange(val: boolean) {
  const setTheme = () => {
    mode.value = val ? 'dark' : 'light';
  };

  const doAnimate = () => {
    const radius = Math.hypot(
      Math.max(pos.value.x, window.innerWidth - pos.value.x),
      Math.max(pos.value.y, window.innerHeight - pos.value.y)
    );

    const clipPath = [
      `circle(0px at ${pos.value.x}px ${pos.value.y}px)`,
      `circle(${radius}px at ${pos.value.x}px ${pos.value.y}px)`
    ];

    document.documentElement.animate(
      { clipPath: val ? clipPath.reverse() : clipPath },
      {
        duration: 600,
        pseudoElement: val
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)'
      }
    );
  };

  document.startViewTransition
    ? document.startViewTransition(setTheme).ready.then(doAnimate)
    : setTheme();
}
</script>

<style>
.XSwitchTheme {
  .el-switch__action {
    background-color: transparent;
  }
}

::view-transition-new(root),
::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
.dark::view-transition-old(root) {
  z-index: 9999999999;
}
</style>
