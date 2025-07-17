<template>
  <div class="p-4 space-y-12">
    <section>
      <h2 class="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-green-500 pl-3">案例二：高级定制与生命周期钩子</h2>
      <div class="bg-white rounded-xl shadow-lg p-6">
        <crud-table
            ref="crudTableRefDefault"
            theme="large-screen"
            :border="true"
            :searchForm="dialogFormConfig"
            :api-url-query="'/api/paper/list'"
            :api-url-detail="'/api/paper'"
            :api-url-create="'/api/paper'"
            :api-url-update="'/api/paper'"
            :api-url-delete="'/api/paper'"
            actionsColumnWidth="150"
            row-key="id"
            :columns="tableColumns"
            :initial-search-form="{ pageNum: 1, pageSize: 10 }"
        >
          <!--   表格的检索条件   -->
          <template #query-conditions="{ searchForm }">
            <el-form-item label="论文标题" class="flex items-center">
              <el-input v-model="searchForm.paperName" placeholder="输入论文标题搜索" clearable/>
            </el-form-item>
          </template>
        </crud-table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CrudTable from './components/CrudTable.vue'; // 确认路径正确
import type { FormRules } from 'element-plus';

// --- 通用引用 ---
const advancedCrudTable = ref<any>(null);

// --- 案例二：高级配置 ---
const advancedColumns = ref([
  { prop: 'name', label: '姓名', width: 150, sortable: true },
  { prop: 'email', label: '邮箱', width: 220 },
  { prop: 'role', label: '角色', width: 120 },
  { prop: 'status', label: '状态', slot: 'statusSlot', width: 100 }, // 使用插槽
  { prop: 'createdAtFormatted', label: '创建时间' } // 格式化后的字段
]);

const advancedFormConfig = ref([
  { type: 'input', prop: 'title', label: '论文标题', componentProps: { placeholder: '请输入标题', clearable: true } },
  { type: 'input', prop: 'author', label: '作者', componentProps: { placeholder: '请输入作者姓名' } },
  { type: 'input', prop: 'journal', label: '发表期刊', componentProps: { placeholder: '请输入期刊名称' } },
  { type: 'input', prop: 'publishDate', label: '发表日期', componentProps: { placeholder: '例如: 2024-01-01' } },
]);

const formRules = ref<FormRules>({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
});


// --- 生命周期钩子与自定义方法 ---

/**
 * 查询前钩子：添加一个固定的 token 参数
 */
const handleBeforeQuery = (params: any) => {
  console.log('生命周期钩子: onBeforeQuery, 原始参数:', params);
  const finalParams = { ...params, authToken: 'my-secret-token' };
  console.log('修改后参数:', finalParams);
  return finalParams;
};

/**
 * 查询后钩子：格式化日期并添加一个模拟的状态字段
 */
const handleAfterQuery = (data: any[]) => {
  console.log('生命周期钩子: onAfterQuery, 原始数据:', data);
  return data.map((item, index) => ({
    ...item,
    createdAtFormatted: new Date(item.createdAt).toLocaleString(),
    status: index % 2 === 0 ? 'active' : 'inactive'
  }));
};

/**
 * 提交前钩子：为密码字段（如果存在）进行伪加密
 */
const handleBeforeSubmit = (data: any) => {
  console.log('生命周期钩子: onBeforeSubmit, 原始表单数据:', data);
  const finalData = { ...data };
  if (finalData.password) {
    finalData.password = `encrypted_${finalData.password}`;
  }
  console.log('处理后提交数据:', finalData);
  return finalData;
};

/**
 * 删除前钩子：禁止删除 ID 为 1 的管理员用户
 */
const handleBeforeDelete = (ids: number[]) => {
  console.log('生命周期钩子: onBeforeDelete, 待删除ID:', ids);
  if (ids.includes(1)) {
    ElMessage.error('禁止删除超级管理员 (ID: 1)！');
    return false; // 返回 false 中止删除
  }
  return true;
};

// 自定义操作
const handleBatchDisable = (selections: any[]) => {
  const ids = selections.map(s => s.id);
  ElMessageBox.confirm(`确定要禁用选中的 ${ids.length} 个用户吗?`, '批量禁用')
      .then(() => {
        ElMessage.success(`已发送禁用请求，用户ID: ${ids.join(', ')}`);
      })
      .catch(() => {});
};

const handleViewDetails = (row: any) => {
  ElMessageBox.alert(JSON.stringify(row, null, 2), `用户 ${row.name} 的详情`);
};

const handleResetPassword = (id: number) => {
  ElMessage.success(`已为用户 ${id} 发送密码重置请求。`);
};

</script>