import request from '@/utils/request';
import type { User, UserQuery } from '@/types'; // FIX: Ensure path alias is used here as well

// This file is a mock API layer for demonstration.
// In a real application, these functions would make actual HTTP requests.

const mockDatabase: User[] = Array.from({ length: 53 }, (_, i) => ({
    id: i + 1,
    name: `用户-${i + 1}`,
    email: `user${i+1}@example.com`,
    role: (['admin', 'user', 'guest'] as const)[i % 3],
    state: 'CA',
    city: 'Los Angeles',
    address: `${i + 100} Main St`,
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 30),
}));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiQuery = async (params: { pageNum: number, pageSize: number } & UserQuery) => {
    await sleep(300);
    let data = mockDatabase.filter(item => {
        const nameMatch = params.name ? item.name.includes(params.name) : true;
        const roleMatch = params.role ? item.role === params.role : true;
        return nameMatch && roleMatch;
    });
    const total = data.length;
    const paginatedData = data.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize);
    return { data: paginatedData, total };
};

export const mockApiDetail = async (params: { id: number }) => {
    await sleep(200);
    const user = mockDatabase.find(u => u.id === params.id);
    return { data: user };
};


export const mockApiCreate = async (data: Partial<User>) => {
    await sleep(300);
    const newUser: User = { id: Date.now(), createdAt: Date.now(), ...data } as User;
    mockDatabase.unshift(newUser);
    return { data: newUser };
};

export const mockApiUpdate = async (data: User) => {
    await sleep(300);
    const index = mockDatabase.findIndex(item => item.id === data.id);
    if (index !== -1) {
        mockDatabase[index] = { ...mockDatabase[index], ...data };
    }
    return { data: mockDatabase[index] };
};

export const mockApiDelete = async (params: { ids: string }) => {
    await sleep(300);
    const idsToDelete = params.ids.split(',').map(Number);
    mockDatabase = mockDatabase.filter(item => !idsToDelete.includes(item.id));
    return { success: true };
};
