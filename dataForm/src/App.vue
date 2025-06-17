<template>
  <div class="max-w-7xl mx-auto">
    <header class="mb-10 text-center">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-800">可复用的 CRUD 表格组件</h1>
      <p class="mt-3 text-lg text-slate-600">一份根据技术报告构建的完整交互式演示</p>
    </header>
    <main>
      <div class="crud-container bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-hidden">
        <crud-table
            ref="crudTableRef"
            :api-query="mockApiQuery"
            :api-create="mockApiCreate"
            :api-update="mockApiUpdate"
            :api-delete="mockApiDelete"
            :api-batch-delete="mockApiBatchDelete"
            dialog-width="600px"
            stripe
            border
            row-key="id"
            :initial-search-form="{ role: null }"
            :initial-page-size="5"
            :page-sizes="[5, 10, 20, 50]"
            :dialog-form-config="dialogFormConfig"
            :dialog-form-rules="formRules"
        >
          <template #header>
            <h2 class="text-2xl font-semibold text-slate-700 mb-6">用户管理</h2>
          </template>

          <el-table-column type="selection" width="55" fixed />
          <el-table-column type="expand" width="50">
            <template #default="props">
              <div class="p-4 bg-slate-50 rounded-md">
                <p class="font-semibold text-slate-700 mb-2">详细配送信息:</p>
                <ul class="list-disc list-inside text-slate-600 space-y-1">
                  <li><span class="font-medium">州:</span> {{ props.row.state }}</li>
                  <li><span class="font-medium">城市:</span> {{ props.row.city }}</li>
                  <li><span class="font-medium">街道地址:</span> {{ props.row.address }}</li>
                </ul>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" sortable width="150" />
          <el-table-column prop="email" label="邮箱" min-width="200" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)" disable-transitions>
                {{ formatRole(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="200" sortable>
            <template #default="scope">
              {{ new Date(scope.row.createdAt).toLocaleString() }}
            </template>
          </el-table-column>

          <template #query-conditions="{ searchForm }">
            <el-form-item label="姓名">
              <div style="width: 300px">
                <el-input v-model="searchForm.name" placeholder="输入姓名模糊搜索" clearable />
              </div>
            </el-form-item>
            <el-form-item label="角色">
              <el-select v-model="searchForm.role" placeholder="选择角色" clearable style="width: 120px;">
                <el-option label="管理员" value="admin" />
                <el-option label="用户" value="user" />
                <el-option label="访客" value="guest" />
              </el-select>
            </el-form-item>
          </template>
          <template #query-right>
            <el-button @click="handleExport" type="info" plain>导出</el-button>
          </template>
          <template #action-left="{ selections }">
            <el-button @click="handleBatchDelete(selections)" type="danger" plain :disabled="selections.length === 0">批量删除</el-button>
          </template>
        </crud-table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CrudTable from './components/CrudTable.vue';
import type { User } from './types';
import {
  mockApiQuery,
  mockApiCreate,
  mockApiUpdate,
  mockApiDelete,
  mockApiBatchDelete,
} from './api/user';

const crudTableRef = ref<InstanceType<typeof CrudTable> | null>(null);

// Dialog Form Configuration
const dialogFormConfig = ref([
  { type: 'input', prop: 'name', label: '姓名', componentProps: { placeholder: '请输入姓名', clearable: true } },
  { type: 'input', prop: 'email', label: '邮箱', componentProps: { placeholder: '请输入邮箱' } },
  { type: 'radio-group', prop: 'role', label: '角色', options: [{ label: '用户', value: 'user' }, { label: '管理员', value: 'admin' }, { label: '访客', value: 'guest' }] },
  { type: 'input', prop: 'state', label: '州', componentProps: { placeholder: '请输入州' } },
  { type: 'input', prop: 'city', label: '城市', componentProps: { placeholder: '请输入城市' } },
  { type: 'textarea', prop: 'address', label: '地址', componentProps: { placeholder: '请输入地址', rows: 2 } }
]);

const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
});

// Helper functions for display
const getRoleTagType = (role: User['role']) => ({ admin: 'warning', user: 'success', guest: 'info' })[role] || 'info';
const formatRole = (role: User['role']) => ({ admin: '管理员', user: '用户', guest: '访客' })[role] || '未知';

// Custom button handlers
const handleExport = () => {
  ElMessage.info('触发导出操作');
};

const handleBatchDelete = async (selections: User[]) => {
  if (!selections || selections.length === 0) {
    ElMessage.warning('请至少选择一项进行删除');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selections.length} 条数据吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const ids = selections.map(item => item.id);
    await mockApiBatchDelete(ids);
    ElMessage.success('批量删除成功');
    crudTableRef.value?.refresh();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
      console.error('Batch delete error:', error);
    } else {
      ElMessage.info('已取消删除');
    }
  }
};
</script>