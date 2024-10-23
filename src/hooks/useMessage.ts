import { ElMessage, ElMessageBox } from 'element-plus';
import i18n from '@/i18n';
import { showToast } from '@/components/toast';

/**
 * 使用轻消息提示
 * @param message 消息内容。优先支持i18n
 * @param type 消息类型。success/warning/error/info
 * @param options 配置项
 */
export function useMessage(
  message: string,
  type?: 'success' | 'warning' | 'error' | 'info',
  options?: {
    /**
     * 是否启用国际化。默认为true
     */
    i18n?: boolean;
    /**
     * 国际化参数
     */
    params?: Record<string, any>;
  }
) {
  const { t } = i18n.global;
  const messageBox = showToast(
    options?.i18n === false ? message : t(message, options?.params || {}),
    type
  );

  return { messageBox };
}

export function useDeleteMessageBox(
  content: string,
  callback: (
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ) => void
) {
  const { t } = i18n.global;

  ElMessageBox.confirm(
    t('messages.delete_confirm_message', { name: content }),
    t('messages.delete_confirm_title'),
    {
      confirmButtonText: t('btn.confirm'),
      cancelButtonText: t('btn.cancel'),
      distinguishCancelAndClose: true,
      type: 'warning',
      draggable: true
    }
  )
    .then(() => {
      return new Promise(callback);
    })
    .then(() => {
      useMessage('messages.delete_success');
    })
    .catch(action => {
      if (action === 'cancel' || action === 'close') {
        useMessage('messages.cancel', 'info');
      } else {
        useMessage('messages.delete_fail', 'warning');
      }
    });
}

export default useMessage;
