import { ref } from 'vue';
import type { User, UserQuery } from '@/types';

// 模拟数据库
const mockDatabase = ref<User[]>([]);

// 生成模拟数据
const generateData = () => {
    mockDatabase.value = Array.from({ length: 53 }, (_, i) => {
        const id = i + 1;
        const roles: User['role'][] = ['admin', 'user', 'guest'];
        const states = ['CA', 'NY', 'TX', 'FL', 'WA'];
        const cities = ['Los Angeles', 'New York', 'Houston', 'Miami', 'Seattle'];
        return {
            id,
            name: `用户-${id}`,
            email: `user${id}@example.com`,
            role: roles[i % 3],
            state: states[i % 5],
            city: cities[i % 5],
            address: `${100 + i} Bacon St`,
            createdAt: Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 30),
        };
    });
};

// 初始化数据
generateData();

// 模拟网络延迟
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟查询 API
export const mockApiQuery = async (params: UserQuery, pagination: { page: number, pageSize: number }) => {
    await sleep(500);
    let data = [...mockDatabase.value];

    if (params.name) {
        data = data.filter(item => item.name.toLowerCase().includes(params.name!.toLowerCase()));
    }
    if (params.role) {
        data = data.filter(item => item.role === params.role);
    }

    const total = data.length;
    const paginatedData = data.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

    return { data: paginatedData, total };
};

// 模拟创建 API
export const mockApiCreate = async (data: Omit<User, 'id' | 'createdAt'>) => {
    await sleep(300);
    const newItem: User = {
        ...data,
        id: Date.now(),
        createdAt: Date.now(),
    };
    mockDatabase.value.unshift(newItem);
    return newItem;
};

// 模拟更新 API
export const mockApiUpdate = async (id: number, data: Partial<User>) => {
    await sleep(300);
    const index = mockDatabase.value.findIndex(item => item.id === id);
    if (index !== -1) {
        mockDatabase.value[index] = { ...mockDatabase.value[index], ...data };
        return mockDatabase.value[index];
    }
    throw new Error('Item not found');
};

// 模拟删除 API
export const mockApiDelete = async (id: number) => {
    await sleep(300);
    mockDatabase.value = mockDatabase.value.filter(item => item.id !== id);
    return true;
};

// 模拟批量删除 API
export const mockApiBatchDelete = async (ids: number[]) => {
    await sleep(300);
    mockDatabase.value = mockDatabase.value.filter(item => !ids.includes(item.id));
    return true;
};