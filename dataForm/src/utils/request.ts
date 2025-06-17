import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API || '', // 基础URL可以为空，让API URL成为完整的地址
    timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        const res = response.data;
        // 假设后端返回的数据结构为 { code: number, data: any, message: string }
        // 0 或 200 通常代表成功，这里我们以 code !== 200 为例，您可以根据后端规范修改
        // 如果您的后端成功时没有 code 字段，可以直接返回 res
        if (res.code && res.code !== 200) {
            ElMessage({
                message: res.message || 'Error',
                type: 'error',
                duration: 5 * 1000,
            });

            // 示例：处理特定的业务错误码，例如 Token 失效
            if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
                ElMessageBox.confirm('您的登录已过期，可以取消以停留在此页面，或重新登录', '确认登出', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    // 在这里调用重新登录的逻辑，例如清除 token 并跳转到登录页
                    console.log("Redirecting to login page...");
                    // location.reload();
                });
            }

            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            // 如果后端没有返回 code，或者 code 表示成功，则直接返回整个响应数据
            return res;
        }
    },
    (error) => {
        console.log('err: ' + error); // for debug
        let message = '接口错误，请刷新接口';
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    message = '请求错误 (400)';
                    break;
                case 401:
                    message = '未授权，请重新登录 (401)';
                    break;
                case 403:
                    message = '拒绝访问 (403)';
                    break;
                case 404:
                    message = '请求资源不存在 (404)';
                    break;
                case 500:
                    message = '服务器内部错误 (500)';
                    break;
                default:
                    message = `连接错误 (${error.response.status})!`;
            }
        }
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

export default service;
