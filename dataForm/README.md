# 通用工具方法

## 介绍

## request请求封装
```js
import axios from 'axios';
import { getToken, removeToken } from './auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 30000,
});

service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // 按照标准，认证头应该是 'Bearer ' + token
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);


let isHandlingTokenExpiration = false;

const handleTokenExpired = () => {
  if (isHandlingTokenExpiration) {
    return Promise.reject(new Error('Token expiration is being handled.'));
  }

  isHandlingTokenExpiration = true;

  ElMessageBox.alert('您已登出，可以取消以停留在此页面，或重新登录', '确认登出', {
    confirmButtonText: '重新登录',
    type: 'warning',
    showClose: false,
  }).then(() => {
    removeToken();
    router.push('/login');
  }).catch(() => {
    console.warn('用户取消了重新登录的操作');
  }).finally(() => {
    isHandlingTokenExpiration = false;
  });

  return Promise.reject(new Error('Token expired.'));
};


service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.code !== 200) {
      if ([401, 50008, 50012, 50014].includes(res.code)) {
        return handleTokenExpired();
      }

      // 其他业务错误，正常提示
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      });
      return Promise.reject(new Error(res.msg || 'Error'));
    } else {
      return res;
    }
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      return handleTokenExpired();
    }

    let message = '';
    if (error.response) {
      switch (error.response.status) {
        case 403:
          message = '拒绝访问 (403)';
          break;
        case 404:
          message = '请求资源未找到 (404)';
          break;
        case 500:
          message = '服务器内部错误 (500)';
          break;
        default:
          message = `HTTP错误 (${error.response.status})`;
      }
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message = '网络请求超时，请稍后重试';
    } else {
      message = '网络连接异常，请检查您的网络';
    }

    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    });

    return Promise.reject(error);
  }
);

export default service;

```

## Token相关方法

::: code-group
```getToken
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
```
```setToken
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
```
```removeToken
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
```
:::

## 获取通用XML
```js
import axios from 'axios';

export async function fetchGenericXml(targetUrl) {

    const proxyUrl = targetUrl;

    try {
        const response = await axios.get(proxyUrl, {
            responseType: 'text'
        });

        return response;

    } catch (error) {
        console.error(`请求或解析 ${targetUrl} 时出错:`, error);
        if (axios.isAxiosError(error)) {
            console.error('Axios 错误详情:', error.response?.status, error.response?.data);
            if (error.code === 'ECONNRESET' || error.response?.status === 504) {
                throw new Error(`代理请求超时或连接被重置。请检查目标URL是否可访问以及网络状况。`);
            }
            throw new Error(`代理请求失败 (状态码: ${error.response?.status || 'N/A'})。请检查URL是否正确以及目标服务器是否正常。`);
        }
        throw new Error(`XML解析失败或发生未知错误。请检查URL返回的是否为标准XML格式。`);
    }
}
```

## 文件下载相关方法
::: code-group
```URL下载
export async function downloadFileByUrl(relativeUrl) {
    if (!relativeUrl || typeof relativeUrl !== 'string') return;

    const host = import.meta.env.VITE_APP_FILE_PREVIEW_API;
    const fullUrl = `${host}${relativeUrl}`;
    const filename = relativeUrl.split('/').pop() || 'document.pdf';

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) throw new Error('下载失败');

        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename; // 此时 download 属性对 blobUrl 100% 生效
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl); // 释放内存
    } catch (error) {
        console.error('强制下载失败，尝试降级方案:', error);
        window.open(fullUrl, '_blank');
    }
}
```
```文件流下载
export function downloadFromBlob(blob, filename) {
  if (!blob || blob.size === 0) {
    console.error('无法下载，因为 Blob 是空的或无效的。');
    return;
  }

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename; 
  link.style.display = 'none'; 

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
}
```
:::