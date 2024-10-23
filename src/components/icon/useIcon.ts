import { defineComponent, ExtractPropTypes, h } from 'vue';
import XIcon from './index';

/**
 * 提供一个快捷创建图标的方法
 */
export function useIcon(props: ExtractPropTypes<typeof XIcon>) {
  return defineComponent({
    setup() {
      return () => h(XIcon, props);
    }
  });
}
