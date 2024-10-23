/*
 * @Author: JeremyJone
 * @Date: 2024-03-05 16:32:00
 * @LastEditors: JeremyJone
 * @LastEditTime: 2024-10-16 14:07:31
 * @Description: 修改 ruoyi 的请求封装
 */
import axios from 'axios';
import { ElLoading, ElMessageBox } from 'element-plus';
import { getToken } from '@/utils/cache/cookies';
import { getJSON, setJSON } from '@/utils/cache/local-storage';
// import { saveAs } from 'file-saver';
import { useUserStoreOutside } from '@/store/modules/user';
import { useMessage } from '@/hooks/useMessage';
import i18n from '@/i18n';
import router from '@/router';

const errorCode: Record<string, string> = {
  '401': 'messages.error_401',
  '403': 'messages.error_403',
  '404': 'messages.error_404',
  default: 'messages.error_other'
};

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value[key] !== '' &&
            typeof value[key] !== 'undefined'
          ) {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + '=';
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result;
}

// 验证是否为blob格式
export function blobValidate(data: any) {
  return data.type !== 'application/json';
}

let downloadLoadingInstance: any;

// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      !isRepeatSubmit &&
      (config.method === 'post' || config.method === 'put')
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === 'object'
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime()
      };
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(
          `[${config.url}]: ` +
            '请求数据大小超出允许的5M限制，无法进行防重复提交验证。'
        );
        return config;
      }
      const sessionObj = getJSON('sessionObj');
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ''
      ) {
        setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = i18n.global.t('messages.repeat_request');
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(message);
        } else {
          setJSON('sessionObj', requestObj);
        }
      }
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

function getErrorMsg(code: any, msg?: string) {
  if (errorCode[code]) return i18n.global.t(errorCode[code]);
  if (msg) return msg;
  return i18n.global.t('messages.error_other');
}

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = getErrorMsg(code, res.data.msg);
    // 二进制数据则直接返回
    if (
      res.request.responseType === 'blob' ||
      res.request.responseType === 'arraybuffer'
    ) {
      return res.data;
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm(
          i18n.global.t('messages.relogin_tips'),
          i18n.global.t('messages.system_hint'),
          {
            confirmButtonText: i18n.global.t('btn.relogin'),
            cancelButtonText: i18n.global.t('btn.cancel'),
            type: 'warning'
          }
        )
          .then(() => {
            isRelogin.show = false;
            router.push('/logout');
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject(i18n.global.t('messages.relogin_tips'));
    } else if (code === 500) {
      useMessage(msg, 'error', { i18n: false });
      return Promise.reject(msg);
    } else if (code === 601) {
      useMessage(msg, 'warning', { i18n: false });
      return Promise.reject(msg);
    } else if (code !== 200) {
      useMessage(msg, 'warning', { i18n: false });
    } else {
      return Promise.resolve(res.data);
    }
  },
  error => {
    let { message } = error;
    if (message == 'Network Error') {
      message = i18n.global.t('messages.error_net_err');
    } else if (message.includes('timeout')) {
      message = i18n.global.t('messages.error_net_timeout');
    } else if (message.includes('Request failed with status code')) {
      message = i18n.global.t('messages.error_server', {
        msg: message.substr(message.length - 3)
      });
    }
    useMessage(message, 'error', { i18n: false });
    return Promise.reject(error);
  }
);

// // 通用下载方法
// export function download(
//   url: string,
//   params: any,
//   filename: any,
//   config: Record<string, any> = {}
// ) {
//   downloadLoadingInstance = ElLoading.service({
//     text: i18n.global.t('messages.downloading'),
//     background: 'rgba(0, 0, 0, 0.7)'
//   });
//   return service
//     .post(url, params, {
//       transformRequest: [
//         params => {
//           return tansParams(params);
//         }
//       ],
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       responseType: 'blob',
//       ...config
//     })
//     .then(async (data: any) => {
//       const isBlob = blobValidate(data);
//       if (isBlob) {
//         const blob = new Blob([data]);
//         saveAs(blob, filename);
//       } else {
//         const resText = await data.text();
//         const rspObj = JSON.parse(resText);
//         const errMsg = getErrorMsg(rspObj.code, rspObj.msg);
//         useMessage(errMsg, 'error');
//       }
//       downloadLoadingInstance.close();
//     })
//     .catch(r => {
//       console.error(r);
//       useMessage('messages.error_download', 'error');
//       downloadLoadingInstance.close();
//     });
// }

export const request = service;
export default service;
