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
      export-position="bottom"
      :api-url-export="apiUrls.export"
  >
    <template #query-conditions="{ searchForm }">
      <el-form-item label="年份">
        <el-date-picker
            v-model="searchForm.applicationYear"
            type="year"
            value-format="YYYY"
            placeholder="选择年份"
            style="width: 150px"
            clearable
        />
      </el-form-item>
      <el-form-item label="论文标题">
        <el-input v-model="searchForm.title" placeholder="请输入论文标题" clearable />
      </el-form-item>
      <el-form-item label="主要作者">
        <el-input v-model="searchForm.author" placeholder="请输入主要作者" clearable />
      </el-form-item>
      <el-form-item label="刊登期刊">
        <el-input v-model="searchForm.journal" placeholder="请输入期刊名" clearable />
      </el-form-item>
      <el-form-item label="期刊分级">
        <el-select v-model="searchForm.journalLevel" placeholder="选择分级" clearable style="width: 120px">
          <el-option v-for="item in journalLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </template>

    <template #affiliatedUnit="{ row }">
      <el-tag type="primary" effect="plain">{{ getUnitLabel(row.affiliatedUnit) }}</el-tag>
    </template>

    <template #journalType="{ row }">
      <el-tag type="info">{{ getLabel(journalTypeOptions, row.journalType) }}</el-tag>
    </template>

    <template #journalLevel="{ row }">
      <el-tag :type="getLevelTagType(row.journalLevel)">
        {{ getLabel(journalLevelOptions, row.journalLevel) }}
      </el-tag>
    </template>

  </crud-table>
</template>

<script setup lang="ts">
import CrudTable from '@/components/CrudTable.vue'; // 确保路径正确
import { ref, onMounted } from 'vue';
// 1. 引入 API

// ================= 1. 数据定义 (改为响应式 Ref) =================

// 定义接口返回的数据类型 (可选，用于TS提示)
interface DictItem {
  dictLabel: string;
  dictValue: string | number;
  [key: string]: any;
}

interface OptionItem {
  label: string;
  value: string | number;
}

const journalTypeOptions = ref<OptionItem[]>([]);  // 期刊类别
const journalLevelOptions = ref<OptionItem[]>([]); // 期刊分级
const unitOptions = ref<OptionItem[]>([]);         // 所属单位

// 辅助函数：通用 Label 获取
// 注意：使用 == 而不是 ===，以兼容后端返回字符串 '1' 但前端使用数字 1 的情况
const getLabel = (options: OptionItem[], value: string | number) => {
  if (value === null || value === undefined) return '';
  const find = options.find(item => item.value == value);
  return find ? find.label : value;
};

// 辅助函数：单位 Label 获取
const getUnitLabel = (value: string | number) => {
  return getLabel(unitOptions.value, value);
};

// 辅助函数：分级颜色
const getLevelTagType = (level: string | number) => {
  // 转为字符串比较，防止类型不一致
  const levelStr = String(level);
  if (levelStr === '1') return 'danger';  // T1
  if (levelStr === '2') return 'warning'; // T2
  if (levelStr === '3') return 'success'; // T3
  return '';
};

// ================= 2. API 数据加载 =================

// 通用映射函数：将后端字典结构 (dictLabel/dictValue) 转换为组件结构 (label/value)
const mapDictToOptions = (data: DictItem[]): OptionItem[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    label: item.dictLabel,
    // ⚠️注意：如果后端返回的是字符串数字，这里可能需要 Number(item.dictValue) 转换，视业务需求而定
    // 这里保持原值，通过 == 比较来兼容
    value: item.dictValue
  }));
};

// 加载字典数据
const loadDictionaries = async () => {
  try {
    // 并行请求三个字典接口
    const [unitRes, typeRes, levelRes] = await Promise.all([
    ]);

    // 1. 赋值给响应式变量 (用于列表页显示)
    unitOptions.value = mapDictToOptions(unitRes.data);
    journalTypeOptions.value = mapDictToOptions(typeRes.data);
    journalLevelOptions.value = mapDictToOptions(levelRes.data);

    // 2. 更新弹窗表单配置 (用于新增/编辑弹窗下拉框)
    // 必须在这里更新，因为 formConfig 是静态定义的，需要手动注入新数据
    updateFormConfigOptions('affiliatedUnit', unitOptions.value);
    updateFormConfigOptions('journalType', journalTypeOptions.value);
    updateFormConfigOptions('journalLevel', journalLevelOptions.value);

  } catch (error) {
    console.error("加载字典数据失败:", error);
  }
};

// 更新 formConfig 中指定字段的 options
const updateFormConfigOptions = (prop: string, options: OptionItem[]) => {
  const field = formConfig.value.find(item => item.prop === prop);
  if (field) {
    field.options = options;
  }
};

onMounted(() => {
  loadDictionaries();
});

// ================= 3. API URL 配置 =================

const apiUrls = {
  query: '/api/system/achResult/pagePaperList',
  detail: '/api/system/achResult/loadPaper',
  create: '/api/system/achResult/insertPaper',
  update: '/api/system/achResult/updatePaper',
  delete: '/api/system/achResult/deletePaper',
  export: '/api/system/achResult/exportPaper',
};

// ================= 4. 表格列配置 =================

const tableColumns = ref([
  { prop: 'publishYear', label: '发表年度', width: 120},
  { prop: 'title', label: '论文名称', width: 150, showOverflowTooltip: true },
  { prop: 'journalLevel', label: '分级', width: 80, slot: 'journalLevel' },
  { prop: 'author', label: '主要作者', width: 120 },
  { prop: 'affiliation', label: '第一作者单位', width: 150, showOverflowTooltip: true },
  { prop: 'affiliatedUnit', label: '成果所属单位', width: 150, slot: 'affiliatedUnit' },
  { prop: 'journal', label: '刊登期刊', width: 120 },
  { prop: 'journalType', label: '刊物类别', slot: 'journalType' },
]);

// ================= 5. 弹窗表单配置 =================

const formConfig = ref([
  {
    type: 'input',
    prop: 'title',
    label: '论文标题',
    span: 12
  },
  {
    type: 'input',
    prop: 'author',
    label: '主要作者',
    span: 12
  },
  {
    label: '发表年度',
    prop: 'publishYear',
    type: 'date-picker',
    componentProps: {
      type: 'year',
      valueFormat: 'YYYY',
      placeholder: '请选择年份',
      clearable: true
    },
    span: 12
  },
  {
    type: 'input',
    prop: 'affiliation',
    label: '第一作者单位',
    span: 12
  },
  {
    type: 'select',
    prop: 'affiliatedUnit',
    label: '所属单位',
    options: [], // 初始为空，onMounted 后填充
    componentProps: {
      placeholder: '请选择所属单位',
      // ✨ 在这里指定自定义的字段映射
      props: {
        label: 'dictName', // 将 label 映射到 dictLabel
        value: 'dictCode'  // 将 value 映射到 dictValue
      }
    },
    span: 12,
  },
  {
    type: 'input',
    prop: 'journal',
    label: '刊登期刊',
    span: 12
  },
  {
    type: 'select',
    prop: 'journalType',
    label: '期刊类别',
    options: [], // 初始为空，onMounted 后填充
    componentProps: {
      placeholder: '请选择期刊类别',
      // ✨ 在这里指定自定义的字段映射
      props: {
        label: 'dictName', // 将 label 映射到 dictLabel
        value: 'dictCode'  // 将 value 映射到 dictValue
      }
    },
    span: 12
  },
  {
    type: 'select',
    prop: 'journalLevel',
    label: '期刊分级',
    options: [], // 初始为空，onMounted 后填充
    componentProps: {
      placeholder: '请选择期刊分级',
      // ✨ 在这里指定自定义的字段映射
      props: {
        label: 'dictName', // 将 label 映射到 dictLabel
        value: 'dictCode'  // 将 value 映射到 dictValue
      }
    },
    span: 12
  },
  {
    type: 'input',
    prop: 'issueNumber',
    label: '卷、期号',
    span: 12
  },
  {
    type: 'input',
    prop: 'pageNumber',
    label: '期刊页码',
    span: 12
  },
  {
    type: 'input',
    prop: 'filePath',
    label: '附件路径',
    span: 24
  }
]);

// ================= 6. 表单校验规则 =================

const formRules = ref({
  title: [{ required: true, message: '请输入论文标题', trigger: 'blur' }],
  author: [{ required: true, message: '请输入主要作者', trigger: 'blur' }],
  publishYear: [{ required: true, message: '请输入发表年度', trigger: 'blur' }],
  affiliatedUnit: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  journal: [{ required: true, message: '请输入刊登期刊', trigger: 'blur' }],
  journalType: [{ required: true, message: '请选择期刊类别', trigger: 'change' }],
  journalLevel: [{ required: true, message: '请选择期刊分级', trigger: 'change' }],
});
</script>