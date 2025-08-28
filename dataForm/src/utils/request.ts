import axios from 'axios';
// ✨ 新增 ElMessageBox 的导入，用于处理 token 失效等需要用户确认的场景
import { ElMessage, ElMessageBox } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
    // VITE_APP_BASE_API 是在 .env 文件中定义的基础 URL
    baseURL: import.meta.env.VITE_APP_BASE_API || '',
    timeout: 10000, // 请求超时时间
});

// 请求拦截器 (保持不变)
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        console.log(error); // for debug
        return Promise.reject(error);
    }
);

// --- 响应拦截器 (核心修改区域) ---
service.interceptors.response.use(
    /**
     * @description 如果您想直接获取诸如 headers 或 status 之类的信息，
     * 请直接返回 response => response
     */
    (response) => {
        // 步骤 1: 从响应中解构出业务数据
        const res = response.data;

        // 步骤 2: 检查业务状态码 `code` 是否为成功状态 (200)
        // 如果 code 不为 200，则代表业务逻辑上出现了错误。
        if (res.code !== 200) {
            // 步骤 3: 使用 ElMessage 弹出业务错误信息
            ElMessage({
                message: res.msg || 'Error', // 使用后端返回的 `msg` 作为错误提示
                type: 'error',
                duration: 5 * 1000,
            });

            // 示例：处理特定的业务错误码，例如 token 失效或被挤下线
            // 您可以根据和后端同事的约定，在这里添加对不同 code 的处理逻辑
            if (res.code === 401 || res.code === 403) {
                // 例如：弹出确认框，引导用户重新登录
                ElMessageBox.confirm(
                    '您的登录状态已失效，请重新登录',
                    '确认登出',
                    {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                ).then(() => {
                    // 在这里执行登出操作，例如清除 token 并刷新页面
                    localStorage.removeItem('token');
                    location.reload();
                });
            }

            // 步骤 4: 抛出一个错误，中断 Promise 链，以便业务代码的 .catch() 可以捕获
            return Promise.reject(new Error(res.msg || 'Error'));
        } else {
            // 步骤 5: 如果业务状态码为 200，则直接返回 res。
            // 这样，在您的业务代码（如 CrudTable.vue）中，.then(res => ...) 里的 res 就是 { code, msg, data } 这个完整的对象。
            return res;
        }
    },
    (error) => {
        // 处理 HTTP 网络层面的错误
        console.log('HTTP Error: ' + error); // for debug
        ElMessage({
            message: '网络错误，请检查您的网络连接或联系管理员', // 提供更友好的网络错误提示
            type: 'error',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

export default service;