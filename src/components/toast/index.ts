import { createVNode, render } from 'vue';
import XToast from './toast.vue';

export default XToast;

export function showToast(message: string, type = 'success', duration = 2000) {
  const div = document.createElement('div');
  div.style.width = '100%';
  document.body.appendChild(div);

  const vm = createVNode(XToast, {
    message,
    type,
    duration
  });

  render(vm, div);

  const destroy = () => {
    const dom = vm.el as HTMLElement;
    dom.classList.add('remove');
    const t = setTimeout(() => {
      render(null, div);
      document.body.removeChild(div);
      clearTimeout(t);
    }, 300);
  };

  if (duration > 0) {
    setTimeout(destroy, duration);
  }

  return {
    destroy
  };
}
