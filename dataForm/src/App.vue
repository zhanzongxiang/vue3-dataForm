<template>
  <crud-table
      :api-url-query="apiUrls.query"
      :api-url-detail="apiUrls.detail"
      :api-url-create="apiUrls.create"
      :api-url-update="apiUrls.update"
      :api-url-delete="apiUrls.delete"
      :columns="tableColumns"
      :dialog-form-config="formConfig"
      :dialog-form-rules="formRules"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CrudTable from '@/components/CrudTable.vue'; // 确保路径正确

// 1. API 地址
const apiUrls = {
  query: '/api/user/list',
  detail: '/api/user/detail',
  create: '/api/user/create',
  update: '/api/user/update',
  delete: '/api/user/delete',
};

// 2. 表格列配置
const tableColumns = ref([
  { prop: 'username', label: '用户名', width: 150 },
  { prop: 'nickname', label: '昵称', width: 150 },
  { prop: 'email', label: '邮箱' },
  { prop: 'role', label: '角色', width: 100 },
  { prop: 'createTime', label: '创建时间', width: 180 },
]);

// 3. 弹窗表单配置 (使用 DynamicForm)
const formConfig = ref([
  { type: 'input', prop: 'username', label: '用户名' },
  { type: 'input', prop: 'nickname', label: '昵称' },
  { type: 'input', prop: 'email', label: '邮箱' },
  {
    type: 'select',
    prop: 'role',
    label: '角色',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
    ],
  },
  { type: 'textarea', prop: 'description', label: '备注' },
]);

// 4. 弹窗表单校验规则
const formRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
});
</script>