import {
  type Component,
  ref,
  shallowRef,
  defineComponent,
  h,
  computed
} from 'vue';

const show = ref(false);
const slot = shallowRef<Component | null>(null);
const width = ref('30%');

/**
 * 右侧抽屉动态组件。
 *
 * @usage 使用方式：直接在需要的组件中的对应事件中调用 setDrawer 方法，传入对应组件即可。组件需要套用 XDrawer 组件。
 */
export function useDrawer() {
  function setDrawer(component: Component, props: Record<string, any> = {}) {
    slot.value = null;

    Promise.resolve()
      .then(() => {
        if (props.width) {
          width.value = props.width;
        }

        slot.value = defineComponent({
          setup() {
            return () =>
              h(component, {
                ...props,
                visible: show.value,
                onClose: () => (show.value = false)
              });
          }
        });
      })
      .then(() => {
        show.value = true;
      });
  }

  return {
    showDrawer: show,
    toggleDrawer() {
      show.value = !show.value;
    },

    close() {
      show.value = false;
    },

    drawerSlot: slot,
    setDrawer,

    /**
     * 设置抽屉宽度，默认 30%。通过 props.width 设置。
     */
    width: computed(() =>
      typeof width.value === 'string' &&
      (width.value.endsWith('%') || width.value.endsWith('px'))
        ? width.value
        : `${parseFloat(`${width.value}`)}px`
    )
  };
}
