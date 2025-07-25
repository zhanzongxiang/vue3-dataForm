<template>
  <div :class="wrapperClass">
    <slot name="header"></slot>
    <div v-if="props.showSearchSection" class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <el-form :model="searchForm" class="query-form flex flex-nowrap items-center gap-x-4"
               style="overflow-x: auto; padding-bottom: 8px;">
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
          <el-button v-if="props.showNewBtn" type="success" @click="openDialog('add')">新增</el-button>
        </slot>
        <slot name="action-right"></slot>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" v-bind="$attrs"
              style="width: 100%; margin-bottom: 1.5rem">
      <el-table-column v-if="props.showSelectionColumn" type="selection" width="55" fixed/>
      <el-table-column v-if="props.showIndexColumn" type="index" label="序号" width="70" fixed/>

      <template v-for="column in props.columns" :key="column.prop">
        <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :sortable="column.sortable || false"
            v-bind="column.attrs"
        >
          <template v-if="column.slot" #default="scope">
            <slot :name="column.slot" :row="scope.row"></slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column v-if="props.showActionsColumn" label="操作" :width="actionsColumnWidth">
        <template #default="scope">
          <div v-if="scope.row" class="flex items-center gap-x-2">

            <slot v-if="$slots.actions" name="actions" :row="scope.row"></slot>

            <template v-else>
              <slot name="action-before-edit" :row="scope.row"></slot>

              <el-button v-if="props.showEditButton" size="small" type="primary" link
                         @click="openDialog('edit', scope.row)">编辑
              </el-button>

              <el-popconfirm v-if="props.showDeleteButton" title="确定要删除这条数据吗?"
                             @confirm="handleDelete([scope.row.id])" confirm-button-text="确定"
                             cancel-button-text="取消" width="200">
                <template #reference>
                  <el-button size="small" type="danger" link>删除</el-button>
                </template>
              </el-popconfirm>

              <slot name="action-after-delete" :row="scope.row"></slot>
            </template>

          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div v-if="props.showPagination && total > 0" class="flex justify-end">
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
    <el-dialog v-model="dialog.visible" :title="dialogTitle" :width="props.dialogWidth" :destroy-on-close="true"
               :custom-class="dialogClass">
      <div v-loading="dialog.loading">
        <slot name="dialog-form-content" :form-data="dialog.data" :mode="dialog.mode">
          <dynamic-form v-if="props.dialogFormConfig.length > 0" :form-config="finalDialogFormConfig"
                        v-model="dialog.data" :ref="el => dialog.formRef = el" :rules="props.dialogFormRules"
                        label-width="80px"/>
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
import {ref, reactive, computed, onMounted, PropType} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import DynamicForm from './DynamicForm.vue';
import request from '@/utils/request';

// --- 1. 组件事件定义 ---
// 定义组件向外触发的自定义事件，允许父组件监听这些关键操作的完成时机。
const emit = defineEmits(['open-dialog', 'submit', 'delete']);

// --- 2. 组件属性 (Props) 定义 ---
// 定义组件接收的所有外部参数，这是组件配置和行为定制的核心。
const props = defineProps({
  /**
   * @description 组件的主题风格
   * @type {'default' | 'large-screen'}
   */
  theme: {type: String as PropType<'default' | 'large-screen'>, default: 'default'},
  customClass: { type: String, default: '' },
  // API 相关配置
  apiUrlQuery: {type: String, required: true},
  apiUrlDetail: {type: String, required: true},
  apiUrlCreate: {type: String, required: true},
  apiUrlUpdate: {type: String, required: true},
  apiUrlDelete: {type: String, required: true},

  showSearchSection: { type: Boolean, default: true }, // ✨ 新增：控制搜索区域显隐

  // 控制新增按钮
  showNewBtn: { type: Boolean, default: true },

  // 表格列定义，通过配置数组动态渲染，比 slot 更灵活。
  columns: {
    type: Array as PropType<any[]>,
    default: () => []
  },

  // 生命周期钩子函数，允许在特定操作前后注入自定义逻辑。
  onBeforeQuery: {type: Function as PropType<(params: any) => Promise<any> | any>},
  onAfterQuery: {type: Function as PropType<(data: any[]) => Promise<any[]> | any[]>},
  onBeforeOpenDialog: {type: Function as PropType<(mode: string, data?: any) => Promise<any> | any>},
  onAfterOpenDialog: {type: Function as PropType<(mode: string, data: any) => void>},
  onBeforeSubmit: {type: Function as PropType<(data: any) => Promise<any> | any>},
  onAfterSubmit: {type: Function as PropType<(mode: string, data: any) => void>},
  onBeforeDelete: {type: Function as PropType<(ids: number[]) => Promise<boolean> | boolean>},
  onAfterDelete: {type: Function as PropType<(ids: number[]) => void>},

  // 功能开关，控制UI元素的显示/隐藏。
  showSelectionColumn: {type: Boolean, default: true},
  showIndexColumn: {type: Boolean, default: true},
  showActionsColumn: {type: Boolean, default: true},
  showEditButton: {type: Boolean, default: true},
  showDeleteButton: {type: Boolean, default: true},
  showNewBtn: {type: Boolean, default: true},

  // UI 定制化配置
  actionsColumnWidth: {type: [String, Number], default: 120},
  dialogWidth: {type: String, default: '50%'},
  initialSearchForm: {type: Object, default: () => ({pageNum: 1, pageSize: 10})},

  // 分页相关配置
  showPagination: {type: Boolean, default: true},
  pageSizes: {type: Array, default: () => [10, 20, 50, 100]},
  paginationLayout: {type: String, default: 'total, sizes, prev, pager, next, jumper'},
  paginationBackground: {type: Boolean, default: true},
  paginationSmall: {type: Boolean, default: false},
  paginationHideOnSinglePage: {type: Boolean, default: false},

  // 弹窗表单配置
  dialogFormConfig: {type: Array as () => any[], default: () => []},
  dialogFormRules: {type: Object, default: () => ({})}
});

// --- 3. 动态计算属性 (Computed) ---

// 根据 `theme` prop 动态计算组件根元素的 CSS 类名。
const wrapperClass = computed(() => ['crud-table-wrapper', `theme-${props.theme}`, props.customClass]);
// 为大屏主题的弹窗动态添加特定的 CSS 类名。
const dialogClass = computed(() => props.theme === 'large-screen' ? 'large-screen-dialog' : '');

// --- 4. 内部工具函数 ---

/**
 * @description 验证传入的 URL prop 是否有效，无效则提示错误。
 * @param {string | undefined} url - 待验证的 URL 字符串。
 * @param {string} propName - prop 的名称，用于错误提示。
 * @returns {boolean} - URL 是否有效。
 */
const validateUrl = (url: string | undefined, propName: string): boolean => {
  if (!url) {
    ElMessage.error(`${propName} prop is required.`);
    return false;
  }
  return true;
};

// [新增] 抽离出核心提交逻辑，并设置为 async
const submit = async (mode: 'add' | 'edit', data: Record<string, any>) => {
  try {
    let finalData = { ...data };
    if (props.onBeforeSubmit) {
      finalData = await props.onBeforeSubmit(finalData);
    }

    dialog.submitting = true; // 依然可以利用内部的 submitting 状态来显示 loading
    if (mode === 'add') {
      if (!validateUrl(props.apiUrlCreate, 'apiUrlCreate')) return;
      await request.post(props.apiUrlCreate, finalData);
      ElMessage.success('新增成功');
    } else {
      if (!validateUrl(props.apiUrlUpdate, 'apiUrlUpdate')) return;
      await request.put(props.apiUrlUpdate, finalData);
      ElMessage.success('更新成功');
    }

    if (props.onAfterSubmit) {
      props.onAfterSubmit(mode, finalData);
    }
    emit('submit', { mode, data: finalData });

    // 如果内部弹窗是打开的，就关闭它
    if (dialog.visible) {
      dialog.visible = false;
    }
    fetchData(); // 刷新表格
    return Promise.resolve(); // 返回一个 resolved Promise
  } catch (error) {
    console.log('Submit error:', error);
    return Promise.reject(error); // 返回一个 rejected Promise
  } finally {
    dialog.submitting = false;
  }
};

// --- 5. 核心响应式状态 ---

// 搜索表单的数据模型，使用 `initialSearchForm` 进行初始化，并包含分页参数。
const searchForm = reactive({pageNum: 1, pageSize: 10, ...props.initialSearchForm});
// 存储从 API 获取的表格数据。
const tableData = ref([]);
// 总记录数，用于分页组件。
const total = ref(0);
// 控制表格加载状态的 loading 指示器。
const loading = ref(false);
// 存储用户在表格中勾选的行数据。
const selections = ref<any[]>([]);
// 统一管理新增/编辑弹窗的状态，包括可见性、加载状态、提交状态、模式及表单数据。
const dialog = reactive<{
  visible: boolean;
  loading: boolean;
  submitting: boolean;
  mode: 'add' | 'edit';
  data: Record<string, any>;
  formRef: any; // 存储 DynamicForm 组件的实例，用于调用其 validate 方法。
}>({visible: false, loading: false, submitting: false, mode: 'add', data: {}, formRef: null});

// --- 6. 衍生的计算属性 ---

// 根据 `dialog.mode` 动态计算弹窗的标题。
const dialogTitle = computed(() => (dialog.mode === 'add' ? '新增' : '编辑'));

// 根据弹窗模式动态计算最终传递给 DynamicForm 的配置。
const finalDialogFormConfig = computed(() => {
  // 新增模式下，过滤掉 'id' 字段。
  if (dialog.mode === 'add') return props.dialogFormConfig.filter(item => item.prop !== 'id');
  // 编辑模式下，确保包含一个禁用的 'id' 输入框以便展示。
  const editConfig = [...props.dialogFormConfig.filter(item => item.prop !== 'id')];
  if (!editConfig.some(i => i.prop === 'id')) {
    editConfig.unshift({type: 'input-disabled', prop: 'id', label: '用户ID'});
  }
  return editConfig;
});

// --- 7.核心业务方法 ---

/**
 * @description 核心数据获取方法，负责请求列表数据并更新表格。
 */
const fetchData = async () => {
  // 校验查询 API 是否已配置
  if (!validateUrl(props.apiUrlQuery, 'apiUrlQuery')) return;
  loading.value = true;
  try {
    // 允许在请求前通过 onBeforeQuery 钩子修改参数
    let finalParams = {...searchForm};
    if (props.onBeforeQuery) {
      finalParams = await props.onBeforeQuery(finalParams);
    }

    // 发起 GET 请求
    const res: any = await request.get(props.apiUrlQuery, {params: finalParams});

    // 校验返回数据格式是否符合预期 { data: [], total: number }
    if (res && Array.isArray(res.data.rows) && typeof res.data.total === 'number') {
      // 允许在数据渲染前通过 onAfterQuery 钩子格式化数据
      let processedData = res.data.rows;
      if (props.onAfterQuery) {
        processedData = await props.onAfterQuery(processedData);
      }
      tableData.value = processedData;
      total.value = res.data.total;
    } else {
      console.warn('API response is not in the expected { data: [], total: 0 } format.');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("Fetch data failed:", error);
  } finally {
    // 无论成功或失败，都关闭 loading 状态
    loading.value = false;
  }
};

/**
 * @description 处理“搜索”按钮点击事件，重置到第一页并重新获取数据。
 */
const handleSearch = () => {
  searchForm.pageNum = 1;
  fetchData();
};

/**
 * @description 处理“清空”按钮点击事件，将搜索条件重置为初始状态。
 */
const handleClearSearch = () => {
  const {pageNum, pageSize, ...initialFilters} = props.initialSearchForm;
  // 清空 searchForm 中除分页外的所有字段
  Object.keys(searchForm).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') delete (searchForm as any)[key];
  });
  // 合并初始搜索条件
  Object.assign(searchForm, initialFilters);
  handleSearch();
};

/**
 * @description 监听表格的多选框变化，更新 `selections` 状态。
 */
const handleSelectionChange = (val: any[]) => {
  selections.value = val;
};

/**
 * @description 打开新增或编辑弹窗的核心逻辑。
 * @param {'add' | 'edit'} mode - 弹窗模式。
 * @param {object} [rowData] - (编辑模式下) 当前行的数据。
 */
const openDialog = async (mode: 'add' | 'edit', dataPayload?: any) => {
  // 1. 定义初始数据变量
  let initialData;
  if (mode === 'add') {
    // 如果是新增模式，且外部传入了数据对象，则使用它；否则使用默认值
    initialData = dataPayload ? { ...dataPayload } : { role: 'user' };
  } else {
    // 编辑模式下，dataPayload 就是行数据
    initialData = { ...dataPayload };
  }

  // 2. onBeforeOpenDialog 钩子仍然可以对 initialData 进行最后修改
  if (props.onBeforeOpenDialog) {
    const processedData = await props.onBeforeOpenDialog(mode, initialData);
    if (processedData) initialData = processedData;
  }

  dialog.mode = mode;
  dialog.visible = true;

  // 3. 后续逻辑基本不变
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
  } else { // 新增模式
    dialog.data = initialData; // 直接使用处理后的 initialData
    if (props.onAfterOpenDialog) {
      props.onAfterOpenDialog(mode, dialog.data);
    }
    emit('open-dialog', { mode, data: dialog.data });
  }
};

/**
 * @description 处理弹窗中“确定”按钮的点击事件，负责表单校验和数据提交。
 */
const handleDialogSubmit = async () => {
  try {
    // 内部表单的验证依然保留
    if (dialog.formRef) await dialog.formRef.validate();
    // 调用新的核心提交方法
    await submit(dialog.mode, dialog.data);
  } catch (validationError) {
    console.log('Validation failed:', validationError);
  }
};

/**
 * @description 处理删除操作，支持单条和批量删除。
 * @param {number[]} ids - 待删除记录的 ID 数组。
 */
const handleDelete = async (ids: number[]) => {
  if (!validateUrl(props.apiUrlDelete, 'apiUrlDelete')) return;
  try {
    // 允许通过 onBeforeDelete 钩子进行删除前的二次确认，返回 false 可中止删除。
    if (props.onBeforeDelete) {
      const canDelete = await props.onBeforeDelete(ids);
      if (canDelete === false) return;
    }

    // 发起删除请求
    const idsString = ids.join(',');
    await request.delete(props.apiUrlDelete + "/" + idsString.toString());
    ElMessage.success('删除成功');

    // 触发删除后的钩子和事件
    if (props.onAfterDelete) {
      props.onAfterDelete(ids);
    }
    emit('delete', ids);

    // 智能分页：如果删除的是当前页的全部数据且不是第一页，则自动跳转到前一页。
    if (tableData.value.length === ids.length && searchForm.pageNum > 1) {
      searchForm.pageNum--;
    }
    fetchData();
  } catch (error) {
    console.error('Delete failed', error);
  }
};

// --- 8. 分页相关方法 ---

/**
 * @description 处理每页显示条数（pageSize）变化的事件。
 */
const handleSizeChange = (val: number) => {
  searchForm.pageSize = val;
  handleSearch();
};
/**
 * @description 处理当前页码（pageNum）变化的事件。
 */
const handleCurrentChange = (val: number) => {
  searchForm.pageNum = val;
  fetchData();
};

// --- 9. Vue 生命周期钩子 ---

// 组件挂载完成后，立即执行一次数据获取。
onMounted(fetchData);

// --- 10. 暴露给父组件的方法 ---
// 使用 defineExpose 使父组件可以通过 ref 调用这些内部方法，实现更灵活的交互。
defineExpose({
  refresh: fetchData, // 刷新表格
  search: handleSearch, // 按当前条件搜索
  handleDelete,         // 手动触发删除
  openDialog,           // 手动打开弹窗
  submit                // 手动提交
});
</script>
