<template>
  <div class="rounded-xl " style="height: 545px; background-color: #666">
    <crud-table
        ref="crudTableRefDefault"
        :border="true"
        :showSelectionColumn="false"
        :searchForm="dialogFormConfig"
        :api-url-query="'/api/system/mysql/getYrosObservationData'"
        :showEditButton="false"
        :showIndexColumn="false"
        :showDeleteButton="true"
        :paginationLayout="'total, prev, pager, next, jumper'"
        :showNewBtn="false"
        :showActionsColumn="false"
        actionsColumnWidth="150"
        row-key="id"
        :columns="advancedColumns"
        :initial-search-form="initialSearch">
      <template #query-conditions="{ searchForm }">
        <el-form-item label="开始时间">
          <el-date-picker
              class="dark"
              v-model="searchForm.startTime"
              type="datetime"
              value-format="x"
              placeholder="选择开始日期时间"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
              class="dark"
              v-model="searchForm.endTime"
              type="datetime"
              value-format="x"
              placeholder="选择结束日期时间"
          />
        </el-form-item>
      </template>
    </crud-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CrudTable from './components/CrudTable.vue'; // 确认路径正确
import type { FormRules } from 'element-plus';

// --- 通用引用 ---
const advancedCrudTable = ref<any>(null);

const dialogFormConfig = ref([
  {type: 'input', prop: 'startTime', label: '开始时间',   componentProps: {placeholder: '请选择开始时间'}},
  {type: 'input', prop: 'endTime',  label: '结束时间', componentProps: {placeholder: '请选择结束时间'}},
]);

const initialSearch = ref({
  startTime: 1756954074865,
  endTime: 1757040474865,
  pageNum: 1,
  pageSize: 10,
});

// --- 案例二：高级配置 ---
const advancedColumns = ref([
  {prop: 'obsv_time', label: '观测时间', headerTooltip: true, attrs: {
      'width': '200px',
    }},
  {prop: 'ea', label: '总辐射辐照度(W/m2)',headerTooltip: true, attrs: {
      'width': '50px'
    }},
  {prop: 'eb', label: '总辐射辐照度分钟最大值(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ec', label: '总辐射辐照度分钟最小值(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ed', label: '总辐射辐照度小时极大值(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ee', label: '日总辐射辐照度极大值(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ef', label: '总辐射辐照度小时极大值时间(时分)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'eg', label: '日总辐射辐照度极大值时间(时分)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'eh', label: '总辐射辐照度小时平均值(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ei', label: '总辐射曝辐量(MJ/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ej', label: '日总辐射曝辐量(MJ/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'ek', label: '总辐射辐照度分钟标准差(W/m2)', attrs: {
      'min-width': '200px'
    }},
  {prop: 'el', label: '机箱温度(℃)', attrs: {
      'min-width': '200px'
    }},
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