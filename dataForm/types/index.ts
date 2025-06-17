// 定义用户数据结构
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    state: string;
    city: string;
    address: string;
    createdAt: number;
}

// 定义查询参数的类型
export interface UserQuery {
    name?: string;
    role?: 'admin' | 'user' | 'guest' | null;
}