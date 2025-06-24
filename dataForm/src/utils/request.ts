import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
    // VITE_APP_BASE_API 是在 .env 文件中定义的基础 URL
    // 您可以根据您的项目需求进行修改
    baseURL: import.meta.env.VITE_APP_BASE_API || '',
    timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        // 例如，从 localStorage 获取 token
        const token = localStorage.getItem('token');
        if (token) {
            // 让每个请求携带自定义 token
            // 请根据实际情况修改 'Authorization' 为后端定义的 token header key
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        console.log(error); // for debug
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.log('err' + error); // for debug
        ElMessage({
            message: '接口错误，请刷新接口', // 这里是您要求的统一错误提示
            type: 'error',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

export default service;
