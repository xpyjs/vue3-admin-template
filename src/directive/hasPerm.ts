/**
 * v-hasPerm 操作权限处理
 * Copyright (c) 2019 ruoyi
 */

import { usePerm } from '@/hooks/usePerm';

export default {
  mounted(el: any, binding: any, vnode: any) {
    const { value } = binding;

    const { check } = usePerm(value);
    check()
      .then(v => {
        if (!v) {
          el.parentNode && el.parentNode.removeChild(el);
        }
      })
      .catch(() => {
        throw new Error(`请设置操作权限标签值`);
      });
  }
};
