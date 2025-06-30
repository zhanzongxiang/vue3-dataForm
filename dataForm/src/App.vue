<template>
  <div class="max-w-7xl mx-auto">
    <header class="mb-10 text-center">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-800">可复用的 CRUD 表格组件</h1>
      <p class="mt-3 text-lg text-slate-600">一份根据技术报告构建的完整交互式演示</p>
    </header>

    <main class="space-y-12">
      <!-- 案例 1: 默认风格 -->
      <div>
        <h2 class="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">案例一：默认风格</h2>
        <div class="crud-container bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-hidden">
          <crud-table
              ref="crudTableRefDefault"
              theme="default"
              :api-url-query="'/api/paper/list'"
              :api-url-detail="'/api/paper'"
              :api-url-create="'/api/paper'"
              :api-url-update="'/api/paper'"
              :api-url-delete="'/api/paper'"
              row-key="id"
              :initial-search-form="{ pageNum: 1, pageSize: 5 }"
          >
            <!-- Columns -->
            <el-table-column prop="name" label="姓名" sortable />
            <el-table-column prop="email" label="邮箱" />
          </crud-table>
        </div>
      </div>

      <!-- 案例 2: 大屏风格 -->
      <div>
        <h2 class="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-teal-500 pl-3">案例二：大屏展示风格</h2>
        <div class="crud-container bg-black rounded-xl shadow-lg overflow-hidden">
          <crud-table
              ref="crudTableRefLarge"
              theme="large-screen"
              :api-url-query="'/api/users'"
              :api-url-detail="'/api/users/detail'"
              :api-url-create="'/api/users'"
              :api-url-update="'/api/users'"
              :api-url-delete="'/api/users'"
              row-key="id"
              :initial-search-form="{ pageNum: 1, pageSize: 5 }"
              :dialog-form-config="dialogFormConfig"
          >
            <template #header>
              <h2 class="text-3xl font-semibold text-gray-800 mb-6">大屏数据中心 - 用户管理</h2>
            </template>
            <el-table-column prop="name" label="用户名称" sortable />
            <el-table-column prop="email" label="电子邮件" />
            <el-table-column prop="role" label="权限等级" />
          </crud-table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CrudTable from './components/CrudTable.vue';

const crudTableRefDefault = ref<any>(null);
const crudTableRefLarge = ref<any>(null);

const dialogFormConfig = ref([
  { type: 'input', prop: 'name', label: '姓名', componentProps: { placeholder: '请输入姓名' } },
  { type: 'input', prop: 'email', label: '邮箱', componentProps: { placeholder: '请输入邮箱' } },
  { type: 'select', prop: 'role', label: '角色', options: [{ label: '管理员', value: 'admin' }, { label: '用户', value: 'user' }] },
]);
</script>
