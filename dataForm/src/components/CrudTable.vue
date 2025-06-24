<template>
  <div :class="wrapperClass">
    <slot name="header"></slot>
    <!-- Search and Actions Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <el-form :model="searchForm" class="query-form flex flex-nowrap items-center gap-x-4" style="overflow-x: auto; padding-bottom: 8px;">
        <slot name="query-conditions" :search-form="searchForm"></slot>
        <el-form-item class="!mr-0 flex-shrink-0">
          <div class="flex items-center gap-x-2">
            <slot name="query-left"></slot>
            <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
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
      <!-- Conditional Selection Column -->
      <el-table-column v-if="props.showSelectionColumn" type="selection" width="55" fixed />
      <!-- Conditional Index Column -->
      <el-table-column v-if="props.showIndexColumn" type="index" label="序号" width="70" fixed />

      <slot></slot>

      <!-- Conditional and Slottable Actions Column -->
      <el-table-column v-if="props.showActionsColumn" label="操作" :width="actionsColumnWidth" fixed="right">
        <template #default="scope">
          <div class="flex items-center gap-x-2">
            <slot name="actions" :row="scope.row">
              <!-- Default action buttons with visibility control -->
              <el-button v-if="props.showEditButton" size="small" type="primary" link @click="openDialog('edit', scope.row)">编辑</el-button>
              <el-popconfirm v-if="props.showDeleteButton" title="确定要删除这条数据吗?" @confirm="handleDelete([scope.row.id])" confirm-button-text="确定" cancel-button-text="取消" width="200">
                <template #reference><el-button size="small" type="danger" link>删除</el-button></template>
              </el-popconfirm>
            </slot>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div v-if="props.showPagination && total > 0" class="flex justify-end mt-[10px]">
      <el-pagination
          v-model:current-page="searchForm.pageNum"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="props.pageSizes"
          :layout="props.paginationLayout"
          :total="total"
          :background="props.paginationBackground"
          :small="props.paginationSmall"
          :hide-on-single-page="props.paginationHideOnSinglePage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialogTitle" :width="props.dialogWidth" :destroy-on-close="true" :custom-class="dialogClass">
      <div v-loading="dialog.loading">
        <slot name="dialog-form-content" :form-data="dialog.data" :mode="dialog.mode">
          <dynamic-form v-if="props.dialogFormConfig.length > 0" :form-config="finalDialogFormConfig" v-model="dialog.data" :ref="el => dialog.formRef = el" :rules="props.dialogFormRules" label-width="80px"/>
        </slot>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogSubmit" :loading="dialog.submitting">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, PropType } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DynamicForm from './DynamicForm.vue';
import request from '@/utils/request';

// Define Emits
const emit = defineEmits(['open-dialog', 'submit', 'delete']);

// Define Props with URL strings and Lifecycle Hooks
const props = defineProps({
  theme: { type: String as PropType<'default' | 'large-screen'>, default: 'default' },
  apiUrlQuery: { type: String, required: true },
  apiUrlDetail: { type: String, required: true },
  apiUrlCreate: { type: String, required: true },
  apiUrlUpdate: { type: String, required: true },
  apiUrlDelete: { type: String, required: true },
  onBeforeQuery: { type: Function as PropType<(params: any) => Promise<any> | any> },
  onAfterQuery: { type: Function as PropType<(data: any[]) => Promise<any[]> | any[]> },
  onBeforeOpenDialog: { type: Function as PropType<(mode: string, data?: any) => Promise<any> | any> },
  onAfterOpenDialog: { type: Function as PropType<(mode: string, data: any) => void> },
  onBeforeSubmit: { type: Function as PropType<(data: any) => Promise<any> | any> },
  onAfterSubmit: { type: Function as PropType<(mode: string, data: any) => void> },
  onBeforeDelete: { type: Function as PropType<(ids: number[]) => Promise<boolean> | boolean> },
  onAfterDelete: { type: Function as PropType<(ids: number[]) => void> },
  showSelectionColumn: { type: Boolean, default: true },
  showIndexColumn: { type: Boolean, default: true },
  showActionsColumn: { type: Boolean, default: true },
  showEditButton: { type: Boolean, default: true },
  showDeleteButton: { type: Boolean, default: true },
  actionsColumnWidth: { type: Number, default: 120 },
  dialogWidth: { type: String, default: '50%' },
  initialSearchForm: { type: Object, default: () => ({ pageNum: 1, pageSize: 10 }) },
  showPagination: { type: Boolean, default: true },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  paginationLayout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
  paginationBackground: { type: Boolean, default: true },
  paginationSmall: { type: Boolean, default: false },
  paginationHideOnSinglePage: { type: Boolean, default: false },
  dialogFormConfig: { type: Array as () => any[], default: () => [] },
  dialogFormRules: { type: Object, default: () => ({}) }
});

const wrapperClass = computed(() => ['crud-table-wrapper', `theme-${props.theme}`]);
const dialogClass = computed(() => props.theme === 'large-screen' ? 'large-screen-dialog' : '');

// Helper for URL validation
const validateUrl = (url: string | undefined, propName: string): boolean => {
  if (!url) {
    ElMessage.error(`${propName} prop is required.`);
    return false;
  }
  return true;
};

// Component State
const searchForm = reactive({ pageNum: 1, pageSize: 10, ...props.initialSearchForm });
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const selections = ref<any[]>([]);
const dialog = reactive<{ visible: boolean; loading: boolean; submitting: boolean; mode: 'add' | 'edit'; data: Record<string, any>; formRef: any; }>({ visible: false, loading: false, submitting: false, mode: 'add', data: {}, formRef: null });

// Computed Properties
const dialogTitle = computed(() => (dialog.mode === 'add' ? '新增' : '编辑'));
const finalDialogFormConfig = computed(() => {
  if (dialog.mode === 'add') return props.dialogFormConfig.filter(item => item.prop !== 'id');
  const editConfig = [...props.dialogFormConfig.filter(item => item.prop !== 'id')];
  if (!editConfig.some(i => i.prop === 'id')) editConfig.push({ type: 'input-disabled', prop: 'id', label: '用户ID' });
  return editConfig;
});

// Methods
const fetchData = async () => {
  if (!validateUrl(props.apiUrlQuery, 'apiUrlQuery')) return;
  loading.value = true;
  try {
    let finalParams = { ...searchForm };
    if (props.onBeforeQuery) {
      finalParams = await props.onBeforeQuery(finalParams);
    }

    const res: any = await request.get(props.apiUrlQuery, { params: finalParams });

    if (res && Array.isArray(res.data) && typeof res.total === 'number') {
      let processedData = res.data;
      if (props.onAfterQuery) {
        processedData = await props.onAfterQuery(processedData);
      }
      tableData.value = processedData;
      total.value = res.total;
    } else {
      console.warn('API response is not in the expected { data: [], total: 0 } format.');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("Fetch data failed:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  searchForm.pageNum = 1;
  fetchData();
};

const handleClearSearch = () => {
  const { pageNum, pageSize, ...initialFilters } = props.initialSearchForm;
  Object.keys(searchForm).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') delete (searchForm as any)[key];
  });
  Object.assign(searchForm, initialFilters);
  handleSearch();
};

const handleSelectionChange = (val: any[]) => { selections.value = val; };

const openDialog = async (mode: 'add' | 'edit', rowData?: any) => {
  let initialData = mode === 'add' ? { role: 'user' } : { ...rowData };
  if (props.onBeforeOpenDialog) {
    const processedData = await props.onBeforeOpenDialog(mode, initialData);
    if (processedData) initialData = processedData;
  }

  dialog.mode = mode;
  dialog.visible = true;

  if (mode === 'edit') {
    if (!validateUrl(props.apiUrlDetail, 'apiUrlDetail')) return;
    dialog.loading = true;
    try {
      const res: any = await request.get(props.apiUrlDetail, { params: { id: initialData.id } });
      dialog.data = res.data;
    } finally {
      dialog.loading = false;
      if (props.onAfterOpenDialog) {
        props.onAfterOpenDialog(mode, dialog.data);
      }
      emit('open-dialog', { mode, data: dialog.data });
    }
  } else {
    dialog.data = initialData;
    if (props.onAfterOpenDialog) {
      props.onAfterOpenDialog(mode, dialog.data);
    }
    emit('open-dialog', { mode, data: dialog.data });
  }
};

const handleDialogSubmit = async () => {
  try {
    if (dialog.formRef) await dialog.formRef.validate();

    let finalData = { ...dialog.data };
    if (props.onBeforeSubmit) {
      finalData = await props.onBeforeSubmit(finalData);
    }

    dialog.submitting = true;
    if (dialog.mode === 'add') {
      if (!validateUrl(props.apiUrlCreate, 'apiUrlCreate')) return;
      await request.post(props.apiUrlCreate, finalData);
      ElMessage.success('新增成功');
    } else {
      if (!validateUrl(props.apiUrlUpdate, 'apiUrlUpdate')) return;
      await request.put(props.apiUrlUpdate, finalData);
      ElMessage.success('更新成功');
    }

    if (props.onAfterSubmit) {
      props.onAfterSubmit(dialog.mode, finalData);
    }
    emit('submit', { mode: dialog.mode, data: finalData });

    dialog.visible = false;
    fetchData();
  } catch (error) {
    console.log('Submit error or validation failed:', error);
  } finally {
    dialog.submitting = false;
  }
};

const handleDelete = async (ids: number[]) => {
  if (!validateUrl(props.apiUrlDelete, 'apiUrlDelete')) return;
  try {
    if (props.onBeforeDelete) {
      const canDelete = await props.onBeforeDelete(ids);
      if (canDelete === false) return;
    }

    const idsString = ids.join(',');
    await request.delete(props.apiUrlDelete, { params: { ids: idsString } });
    ElMessage.success('删除成功');

    if (props.onAfterDelete) {
      props.onAfterDelete(ids);
    }
    emit('delete', ids);

    if (tableData.value.length === ids.length && searchForm.pageNum > 1) {
      searchForm.pageNum--;
    }
    fetchData();
  } catch (error) {
    console.error('Delete failed', error);
  }
};

const handleSizeChange = (val: number) => { searchForm.pageSize = val; handleSearch(); };
const handleCurrentChange = (val: number) => { searchForm.pageNum = val; fetchData(); };

onMounted(fetchData);

defineExpose({
  refresh: fetchData,
  search: handleSearch,
  handleDelete,
  openDialog,
});
</script>
