# CrudTable - 基于 Vue 3 和 Element Plus 的高级 CRUD 组件

`CrudTable` 是一个功能全面、高度可定制的 CRUD 表格组件，旨在通过声明式的方式，极大地简化数据驱动的页面开发。它封装了常见的增、删、改、查、分页、批量操作等逻辑，让开发者能更专注于业务本身。

## ✨ 功能特性

- **API驱动**: 通过 props 传入 URL 字符串，组件内置 `axios` 请求逻辑。
- **高度可定制**: 提供丰富的插槽，用于自定义查询条件、表格列、操作按钮等。
- **配置驱动表单**: 支持通过 JSON 数组配置动态渲染新增/编辑弹窗内的表单。
- **完整的 `el-table` 功能**: 继承 `el-table` 所有原生属性和事件，无缝衔接现有使用习惯。
- **强大的生命周期**: 提供完整的 `onBefore` 和 `onAfter` 钩子，方便在操作前后进行数据处理和逻辑注入。
- **灵活的列控制**: 可通过 props 单独控制多选框、序号列、操作列以及编辑/删除按钮的显示与隐藏。
- **开箱即用**: 内置了分页、单行删除、批量删除等常用功能。

## 📦 安装

```
npm install your-crud-table-package-name

```

## 🚀 快速上手

在您的 Vue 组件中使用 `CrudTable`。

```
<template>
  <crud-table
    ref="crudTableRef"
    :api-url-query="'/api/users'"
    :api-url-detail="'/api/users/detail'"
    :api-url-create="'/api/users'"
    :api-url-update="'/api/users'"
    :api-url-delete="'/api/users'"
    :initial-search-form="{ pageNum: 1, pageSize: 5 }"
    :dialog-form-config="dialogFormConfig"
  >
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="email" label="邮箱" />
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CrudTable from 'your-crud-table-package-name';

const crudTableRef = ref(null);

const dialogFormConfig = ref([
  { type: 'input', prop: 'name', label: '姓名' },
  { type: 'input', prop: 'email', label: '邮箱' },
]);
</script>

```

## **API 文档**

### **属性 (Props)**

| 属性名 | 描述 | 类型 | 是否必需 | 默认值 |
| --- | --- | --- | --- | --- |
| **API 配置** |  |  |  |  |
| `apiUrlQuery` | 获取表格列表数据的接口地址。 | `String` | `true` | - |
| `apiUrlDetail` | 获取单条数据详情的接口地址（用于编辑时回填表单）。 | `String` | `true` | - |
| `apiUrlCreate` | 创建新条目的接口地址。 | `String` | `true` | - |
| `apiUrlUpdate` | 更新条目的接口地址。 | `String` | `true` | - |
| `apiUrlDelete` | 删除条目的接口地址。 | `String` | `true` | - |
| **功能控制** |  |  |  |  |
| `showSelectionColumn` | 是否显示表格的多选框列。 | `Boolean` | `false` | `true` |
| `showIndexColumn` | 是否显示表格的序号列。 | `Boolean` | `false` | `true` |
| `showActionsColumn` | 是否显示操作列。 | `Boolean` | `false` | `true` |
| `showEditButton` | 是否在操作列中显示默认的“编辑”按钮。 | `Boolean` | `false` | `true` |
| `showDeleteButton` | 是否在操作列中显示默认的“删除”按钮。 | `Boolean` | `false` | `true` |
| `actionsColumnWidth` | 操作列的宽度。 | `Number` | `false` | `120` |
| **表单与弹窗** |  |  |  |  |
| `dialogWidth` | 新增/编辑弹窗的宽度。 | `String` | `false` | `'50%'` |
| `dialogFormConfig` | **动态表单配置数组**，用于快速生成弹窗内的表单。 | `Array` | `false` | `[]` |
| `dialogFormRules` | 弹窗表单的 [Element Plus 验证规则](https://element-plus.org/zh-CN/component/form.html#%E8%A1%A8%E5%8D%95%E6%A0%A1%E9%AA%8C)。 | `Object` | `false` | `{}` |
| **分页配置** |  |  |  |  |
| `initialSearchForm` | 查询表单的初始值，**包含初始分页参数 `pageNum` 和 `pageSize`**。 | `Object` | `false` | `{ pageNum: 1, pageSize: 10 }` |
| `showPagination` | 是否显示分页组件。 | `Boolean` | `false` | `true` |
| `pageSizes` | 每页显示个数选择器的选项设置。 | `Array` | `false` | `[10, 20, 50, 100]` |
| `paginationLayout` | 分页组件布局。 | `String` | `false` | `'total, sizes, prev, pager, next, jumper'` |
| `paginationBackground` | 是否为分页按钮添加背景色。 | `Boolean` | `false` | `true` |
| `paginationSmall` | 是否使用小型分页样式。 | `Boolean` | `false` | `false` |
| `paginationHideOnSinglePage` | 只有一页时是否隐藏分页。 | `Boolean` | `false` | `false` |
| **生命周期钩子** |  |  |  |  |
| `onBeforeQuery` | 查询请求**前**执行。可用于修改请求参数。**必须返回**处理后的参数对象。 | `Function` | `false` | - |
| `onAfterQuery` | 查询请求**后**执行。可用于格式化返回的列表数据。**必须返回**处理后的数据数组。 | `Function` | `false` | - |
| `onBeforeOpenDialog` | 打开弹窗**前**执行。可用于预处理表单数据。 | `Function` | `false` | - |
| `onAfterOpenDialog` | 打开弹窗**后**执行。可用于在弹窗渲染后执行某些操作。 | `Function` | `false` | - |
| `onBeforeSubmit` | 表单提交**前**执行。可用于序列化提交的数据。**必须返回**处理后的数据对象。 | `Function` | `false` | - |
| `onAfterSubmit` | 表单提交**后**执行。可用于执行提交成功后的副作用。 | `Function` | `false` | - |
| `onBeforeDelete` | 删除操作**前**执行。可用于进行额外的确认。**返回 `false` 可中止删除**。 | `Function` | `false` | - |
| `onAfterDelete` | 删除操作**后**执行。可用于执行删除成功后的副作用。 | `Function` | `false` | - |

### **插槽 (Slots)**

| 插槽名称 | 作用域 (Props) | 描述 |
| --- | --- | --- |
| `default` | - | **（核心）** 用于定义表格的列 (`<el-table-column>`)，除了序号列、复选框列和操作列。 |
| `header` | - | 在整个组件最顶部插入内容，如页面大标题。 |
| `query-conditions` | `{ searchForm }` | 自定义查询区域的表单项。`searchForm` 是响应式的查询对象。 |
| `query-left` | - | 在“搜索”按钮左侧添加自定义按钮或内容。 |
| `query-right` | - | 在“清空”按钮右侧添加自定义按钮或内容。 |
| `action-left` | `{ selections }` | 在“新增”按钮左侧添加自定义按钮，可通过 `selections` 访问当前勾选的数据。 |
| `action-right` | - | 在“新增”按钮右侧添加自定义按钮。 |
| `actions` | `{ row }` | **（重要）** 自定义操作列的内容，可用于添加、修改或完全替换默认的编辑/删除按钮。 |
| `dialog-form-content` | `{ formData, mode }` | **完全自定义**新增/编辑弹窗的表单内容。如果使用此插槽，`dialogFormConfig` 将被忽略。 |

### **事件 (Events)**

| 事件名称 | 载荷 (Payload) | 描述 |
| --- | --- | --- |
| `@open-dialog` | `{ mode: string, data: object }` | 在新增或编辑弹窗打开后触发。 |
| `@submit` | `{ mode: string, data: object }` | 在表单提交（新增或更新）成功**后**触发。 |
| `@delete` | `number[]` | 在删除操作成功**后**触发，载荷为被删除的 ID 数组。 |

### **暴露的方法 (Exposed Methods)**

通过 `ref` 可以获取到组件实例，并调用其暴露的方法。

| 方法名称 | 参数 | 描述 |
| --- | --- | --- |
| `refresh()` | - | 强制刷新表格数据，使用当前的查询条件和分页状态。 |
| `search()` | - | 重置到第一页并刷新数据，相当于点击“搜索”按钮。 |
| `handleDelete(ids: number[])` | `ids` (ID 数组) | 触发删除操作，可用于父组件中自定义的批量删除逻辑。 |
| `openDialog(mode, data)` | `mode`, `data` | 手动打开新增/编辑弹窗。 |

## **实践案例**

```
<template>
  <crud-table
    ref="crudTableRef"
    :api-url-query="'/api/users'"
    :api-url-detail="'/api/users/detail'"
    :api-url-create="'/api/users'"
    :api-url-update="'/api/users'"
    :api-url-delete="'/api/users'"
    :show-delete-button="false"
    actions-column-width="140"
    :initial-search-form="{ role: null, pageNum: 1, pageSize: 5 }"
    @submit="onSubmit"
    :on-after-query="handleAfterQuery"
  >
    <template #header>
      <h2 class="text-2xl font-semibold text-slate-700 mb-6">用户管理</h2>
    </template>

    <el-table-column prop="name" label="姓名" sortable />
    <el-table-column prop="role" label="角色">
        <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'warning' : 'info'">
                {{ scope.row.role }}
            </el-tag>
        </template>
    </el-table-column>
    <el-table-column prop="createdAtFormatted" label="创建时间" />

    <template #query-conditions="{ searchForm }">
        <el-form-item label="姓名">
            <el-input v-model="searchForm.name" clearable />
        </el-form-item>
    </template>

    <template #actions="{ row }">
        <el-button size="small" type="primary" link @click="crudTableRef?.openDialog('edit', row)">编辑</el-button>
        <el-button size="small" type="success" link @click="handleViewDetails(row)">详情</el-button>
    </template>
  </crud-table>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CrudTable from './components/CrudTable.vue';

const crudTableRef = ref(null);

// 使用生命周期钩子格式化数据
const handleAfterQuery = (data) => {
    return data.map(item => ({
        ...item,
        createdAtFormatted: new Date(item.createdAt).toLocaleString('zh-CN'),
    }));
};

// 监听事件
const onSubmit = (payload) => {
    ElMessage.success(`[Event] ${payload.mode} success!`);
};

// 自定义方法
const handleViewDetails = (row) => {
    ElMessageBox.alert(JSON.stringify(row, null, 2), '详情');
};
</script>
```