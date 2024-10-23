<template>
  <div class="x-toast fixed bottom-100px px-16px py-8px rounded-8px">
    <span class="mr-4px v-middle">
      <XIcon color="var(--x-bg-color)" :name="icon" size="1.2rem" />
    </span>
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import XIcon from '../icon';
import { computed } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String as PropType<'success' | 'warning' | 'error' | 'info'>,
    default: 'success'
  },
  duration: {
    type: Number,
    default: 2000
  }
});

const icon = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'fe:warning';
    case 'error':
      return 'mi:circle-error';
    case 'info':
      return 'uil:comment-info';
    case 'success':
    default:
      return 'gg:check-o';
  }
});
</script>

<style scoped lang="scss">
.x-toast {
  z-index: 99999999;
  color: var(--x-bg-color);
  background-color: var(--x-toast-bg-color);
  font-size: 1rem;
  line-height: 1.5;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s;
  animation: fade-in 0.3s forwards;
}

.x-toast.remove {
  animation: fade-out 0.3s forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
