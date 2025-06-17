<template>
  <div class="crud-table-wrapper">
    <slot name="header"></slot>
    <!-- Search and Actions Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <!-- NOTE: Changed flex-wrap to flex-nowrap to keep search items on one line -->
      <el-form :model="searchForm" class="query-form flex flex-nowrap items-center gap-x-4" style="overflow-x: auto; padding-bottom: 8px;">
        <slot name="query-conditions" :search-form="searchForm"></slot>
        <el-form-item class="!mr-0 flex-shrink-0">
          <div class="flex items-center gap-x-2">
            <slot name="query-left"></slot>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleClearSearch">清空</el-button>
            <slot name="query-right"></slot>
          </div>
        </el-form-item>
      </el-form>
      <div class="flex items-center gap-x-3 action-buttons flex-shrink-0">
        <slot name="action-left" :selections="selections"></slot>
        <slot name="add-button-content">
          <el-button type="success" @click="openDialog('add')">新增</el-button>
        </slot>
        <slot name="action-right"></slot>
      </div>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" v-bind="$attrs" style="width: 100%;">
      <slot></slot>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
          <el-popconfirm title="确定要删除这条数据吗?" @confirm="handleDelete(scope.row)" confirm-button-text="确定" cancel-button-text="取消" width="200">
            <template #reference><el-button size="small" type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <!-- NOTE: Changed to justify-end and set margin-top to 10px -->
    <div v-if="props.showPagination && pagination.total > 0" class="flex justify-end mt-[10px]">
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="props.pageSizes" :layout="props.paginationLayout" :total="pagination.total" :background="props.paginationBackground" :small="props.paginationSmall" :hide-on-single-page="props.paginationHideOnSinglePage" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialogTitle" :width="props.dialogWidth" :destroy-on-close="true">
      <slot name="dialog-form-content" :form-data="dialog.data" :mode="dialog.mode">
        <dynamic-form v-if="props.dialogFormConfig.length > 0" :form-config="finalDialogFormConfig" v-model="dialog.data" :ref="el => dialog.formRef = el" :rules="props.dialogFormRules" label-width="80px"/>
      </slot>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import DynamicForm from './DynamicForm.vue';

// Define Props
const props = defineProps({
  apiQuery: { type: Function, required: true },
  apiCreate: { type: Function },
  apiUpdate: { type: Function },
  apiDelete: { type: Function },
  apiBatchDelete: { type: Function },
  dialogWidth: { type: String, default: '50%' },
  initialSearchForm: { type: Object, default: () => ({}) },
  showPagination: { type: Boolean, default: true },
  initialCurrentPage: { type: Number, default: 1 },
  initialPageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  paginationLayout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
  paginationBackground: { type: Boolean, default: true },
  paginationSmall: { type: Boolean, default: false },
  paginationHideOnSinglePage: { type: Boolean, default: false },
  dialogFormConfig: { type: Array as () => any[], default: () => [] },
  dialogFormRules: { type: Object, default: () => ({}) }
});

// Component State
const searchForm = reactive({ ...props.initialSearchForm });
const tableData = ref([]);
const loading = ref(false);
const selections = ref<any[]>([]);

const pagination = reactive({
  currentPage: props.initialCurrentPage,
  pageSize: props.initialPageSize,
  total: 0
});

const dialog = reactive<{
  visible: boolean;
  mode: 'add' | 'edit';
  data: Record<string, any>;
  formRef: any;
}>({
  visible: false,
  mode: 'add',
  data: {},
  formRef: null
});

// Computed Properties
const dialogTitle = computed(() => (dialog.mode === 'add' ? '新增' : '编辑'));
const finalDialogFormConfig = computed(() => {
  if (dialog.mode === 'add') {
    return props.dialogFormConfig.filter(item => item.prop !== 'id');
  }
  const editConfig = [...props.dialogFormConfig.filter(item => item.prop !== 'id')];
  if (!editConfig.some(i => i.prop === 'id')) {
    editConfig.push({ type: 'input-disabled', prop: 'id', label: '用户ID' });
  }
  return editConfig;
});

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await props.apiQuery({ ...searchForm }, { page: pagination.currentPage, pageSize: pagination.pageSize });
    if (res && Array.isArray(res.data) && typeof res.total === 'number') {
      tableData.value = res.data;
      pagination.total = res.total;
    } else {
      console.warn('apiQuery did not return a valid {data, total} structure.');
    }
  } catch (error) {
    ElMessage.error('数据加载失败');
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchData();
};

const handleClearSearch = () => {
  Object.keys(searchForm).forEach(key => delete searchForm[key]);
  Object.assign(searchForm, { ...props.initialSearchForm });
  handleSearch();
};

const handleSelectionChange = (val: any[]) => {
  selections.value = val;
};

const openDialog = (mode: 'add' | 'edit', rowData?: any) => {
  dialog.mode = mode;
  dialog.data = mode === 'add' ? { role: 'user' } : JSON.parse(JSON.stringify(rowData));
  dialog.visible = true;
};

const handleDialogSubmit = async () => {
  try {
    if (dialog.formRef) await dialog.formRef.validate();

    const api = dialog.mode === 'add' ? props.apiCreate : props.apiUpdate;
    const message = dialog.mode === 'add' ? '新增成功' : '更新成功';

    if (!api) return ElMessage.error(`api${dialog.mode.charAt(0).toUpperCase() + dialog.mode.slice(1)} prop is not defined.`);

    // For update, pass ID as the first argument
    dialog.mode === 'add' ? await api(dialog.data) : await api(dialog.data.id, dialog.data);

    ElMessage.success(message);
    dialog.visible = false;
    fetchData();
  } catch (error) {
    console.log('Submit error or validation failed:', error);
  }
};

const handleDelete = async (row: any) => {
  if (!props.apiDelete) return ElMessage.error('apiDelete prop is not defined.');
  try {
    await props.apiDelete(row.id);
    ElMessage.success('删除成功');
    if (tableData.value.length === 1 && pagination.currentPage > 1) {
      pagination.currentPage--;
    }
    fetchData();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  fetchData();
};

onMounted(fetchData);

defineExpose({
  refresh: fetchData,
  search: handleSearch
});
</script>
