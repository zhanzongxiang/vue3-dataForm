## 介绍
CrudTable 是一个高度抽象的业务组件，旨在统一项目中表格增删改查的操作体验和开发规范。

它通过“配置驱动”的方式，将一个完整表格页面的功能点抽象为以下几个核心 Prop：

API 配置： 通过 apiUrlQuery, apiUrlDetail, apiUrlCreate, apiUrlUpdate, apiUrlDelete 五个属性自动管理所有后端交互。

表格列配置： columns 数组用于动态渲染 el-table 的列，并支持插槽和表头提示。

弹窗表单配置： dialogFormConfig 数组与内置的 DynamicForm 组件联动，自动渲染新增和编辑时的弹窗表单。

此外，它还提供了丰富的插槽 (Slots) 和生命周期钩子 (Hooks)，允许开发者在不修改组件源码的情况下，轻松注入自定义的搜索条件、行内操作和提交前/后逻辑，在实现高度复用的同时保持了灵活性。
:::tip 提示
表格的请求、查询、编辑、删除接口类型分别为"GET"、"POST"、"PUT"、"DELETE"类型，否则会报错！
:::
## 安装
```NPM
npm install z-crud-table
```

## 引用


## 案例
### 配置驱动
```vue
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
    { prop: 'role', label: '角色', width: 150 },
    { prop: 'createTime', label: '创建时间', width: 150 },
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
      // 自定义字段
      // componentProps: {
      //   placeholder: '请选择角色',
      //   // ✨ 在这里指定自定义的字段映射
      //   props: {
      //     label: 'dictName', // 将 label 映射到 dictLabel
      //     value: 'dictCode'  // 将 value 映射到 dictValue
      //   }
      // },
    },
    { type: 'textarea', prop: 'description', label: '备注' },
    {
      label: '创建时间',
      prop: 'createTime',
      type: 'date-picker', // 对应 DynamicForm 中的 v-if
      componentProps: {
        type: 'date',      // Element Plus 原生属性，指定为日期选择
        valueFormat: 'YYYY-MM-DD', // 指定绑定值的格式
        placeholder: '请选择日期',
        clearable: true
      }
    },
  ]);

  // 4. 弹窗表单校验规则
  const formRules = ref({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  });
</script>
```

### 自定义搜索区 & 表格列内容
```vue
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
  >
    <template #query-conditions="{ searchForm }">
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </template>
    
    <template #status="{ row }">
      <el-tag v-if="row.status === 1" type="success">启用</el-tag>
      <el-tag v-else type="danger">禁用</el-tag>
    </template>

    <template #role="{ row }">
      <el-tag type="primary">{{ row.roleName }}</el-tag>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
  { prop: 'username', label: '用户名' },
  { prop: 'role', label: '角色', slot: 'role' }, // ✨ 指定使用名为 'role' 的插槽
  { prop: 'status', label: '状态', slot: 'status' }, // ✨ 指定使用名为 'status' 的插槽
  { prop: 'createTime', label: '创建时间' },
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
```

### 生命周期函数使用
```vue
<template>
  <crud-table
    ...省略了基础配置（api-url与表头、表单内容等）
    :initial-search-form="{ dateRange: [] }"
    :on-before-query="handleBeforeQuery"
    :on-after-query="handleAfterQuery"
    :on-before-submit="handleBeforeSubmit"
    :on-before-delete="handleBeforeDelete"
  >
    <template #query-conditions="{ searchForm }">
      <el-form-item label="创建日期">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const roleMap = { 1: '管理员', 2: '普通用户', 3: '访客' };
const currentUser = { name: 'admin_user' }; // 假设这是当前登录用户

// 1. 查询前：转换日期参数
const handleBeforeQuery = (params) => {
  const newParams = { ...params };
  if (newParams.dateRange && newParams.dateRange.length === 2) {
    newParams.beginTime = newParams.dateRange[0] + ' 00:00:00';
    newParams.endTime = newParams.dateRange[1] + ' 23:59:59';
  }
  delete newParams.dateRange; // 删除原始数组
  return newParams;
};

// 2. 查询后：处理表格数据
const handleAfterQuery = (tableData, queryParams) => {
  console.log('本次查询的参数是：', queryParams);
  // 映射角色 ID 为角色名称
  return tableData.map(item => ({
    ...item,
    roleName: roleMap[item.roleId] || '未知角色',
  }));
};

// 3. 提交前：附加额外数据
const handleBeforeSubmit = (formData, mode) => {
  if (mode === 'add') {
    formData.createBy = currentUser.name;
  } else {
    formData.updateBy = currentUser.name;
  }
  // 必须返回处理后的 formData
  return formData;
};

// 4. 删除前：进行业务校验
const handleBeforeDelete = async (ids, rows) => {
  // rows 是即将被删除的完整行数据对象
  const hasAdmin = rows.some(row => row.roleName === '管理员');
  if (hasAdmin) {
    ElMessage.error('不能删除“管理员”角色的用户！');
    return false; // 返回 false 中止删除
  }
  
  // 可以返回一个 Promise
  // return ElMessageBox.confirm('确定要删除吗？');
  
  return true; // 返回 true 继续执行
};
</script>
```

### 自定义“操作列”
```vue
<template>
  <crud-table
      ...省略了基础配置（api-url与表头、表单内容等）
  >
    <template #action-before-edit="{ row }">
      <el-button size="small" type="primary" link @click="viewDetails(row)">
        详情
      </el-button>
    </template>
    
    <template #action-after-delete="{ row }">
      <el-button size="small" type="warning" link @click="resetPassword(row)">
        重置密码
      </el-button>
    </template>
    
    </crud-table>
</template>

<script setup lang="ts">
// ...
const viewDetails = (row) => { console.log('查看详情', row.id); };
const resetPassword = (row) => { console.log('重置密码', row.id); };
// const handleApprove = (row) => { ... };
// const handleReject = (row) => { ... };
</script>
```

### 复杂表单
```vue
<template>
  <crud-table
    ...省略了基础配置（api-url与表头、表单内容等）
    :dialog-form-rules="formRules"
  >
    <template #dialog-form="{ formData, formRef }">
      <el-form :ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="formData.userType" @change="onUserTypeChange(formData)">
            <el-option label="普通用户" value="normal" />
            <el-option label="VIP 用户" value="vip" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="formData.userType === 'vip'" label="VIP 等级" prop="vipLevel">
          <el-input-number v-model="formData.vipLevel" :min="1" />
        </el-form-item>
      </el-form>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 校验规则
const formRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
});

// 表单内部联动逻辑
const onUserTypeChange = (formData) => {
  if (formData.userType !== 'vip') {
    formData.vipLevel = undefined; // 清空联动字段
  }
};
</script>
```

### 文件上传表单
```vue
<template>
  <crud-table
      ...省略了基础配置（api-url与表头内容等）
    :dialog-form-rules="formRules"
    :submit-as-form-data="true"
  >
    <template #dialog-form="{ formData, formRef }">
      <el-form :ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        
        <el-form-item label="用户头像" prop="avatarFile">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleAvatarChange"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ...
const formRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  avatarFile: [{ required: true, message: '请上传头像', trigger: 'change' }],
});

// 在 handleBeforeSubmit 钩子中处理文件
const handleBeforeSubmit = (formData, mode) => {
  // `submit` 函数会自动将 `formData` 转换为 FormData 对象
  // 我们只需要确保 `avatarFile` 字段是原始的 File 对象
  console.log('提交前的表单数据：', formData);
  return formData;
};

// el-upload 的 change 事件
const handleAvatarChange = (file, fileList) => {
  // 上传逻辑
};
</script>
```

## 属性
### API 与数据配置

| Prop | 类型 | 必需 | 默认值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `apiUrlQuery` | `String` | 否 | - | (R) 查询列表数据的API地址。 |
| `apiUrlDetail` | `String` | 否 | - | (R) 获取单条数据详情的API地址（编辑时使用）。 |
| `apiUrlCreate` | `String` | 否 | - | (C) 新增数据的API地址。 |
| `apiUrlUpdate` | `String` | 否 | - | (U) 更新数据的API地址。 |
| `apiUrlDelete` | `String` | 否 | - | (D) 删除数据的API地址。 |
| `columns` | `Column[]` | 否 | `[]` | **表格列配置**。详细结构见下文 [数据结构](#4-数据结构)。 |
| `initialSearchForm` | `Object` | 否 | `{ pageNum: 1, pageSize: 10 }` | 搜索表单的初始默认值，包含分页。 |
| `submitAsFormData` | `Boolean` | 否 | `false` | 是否以 `multipart/form-data` 格式提交表单，适用于文件上传。 |

### UI 功能开关

| Prop | 类型 | 必需 | 默认值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `showSearchSection` | `Boolean` | 否 | `true` | 是否显示顶部的搜索区域。 |
| `showSearchActionButtons` | `Boolean` | 否 | `true` | 是否显示“搜索”和“清空”按钮。 |
| `showSearchButton` | `Boolean` | 否 | `true` | 是否显示“搜索”按钮。 |
| `showClearButton` | `Boolean` | 否 | `true` | 是否显示“清空”按钮。 |
| `showNewBtn` | `Boolean` | 否 | `true` | 是否显示“新增”按钮。 |
| `showSelectionColumn` | `Boolean` | 否 | `true` | 是否显示表格的复选框列。 |
| `showIndexColumn` | `Boolean` | 否 | `true` | 是否显示表格的“序号”列。 |
| `showActionsColumn` | `Boolean` | 否 | `true` | 是否显示表格的“操作”列。 |
| `showEditButton` | `Boolean` | 否 | `true` | 是否在操作列中显示“编辑”按钮。 |
| `showDeleteButton` | `Boolean` | 否 | `true` | 是否在操作列中显示“删除”按钮。 |
| `showPagination` | `Boolean` | 否 | `true` | 是否显示分页组件。 |

### 弹窗与表单配置

| Prop                 | 类型                 | 必需 | 默认值     | 描述                                         |
|----------------------|--------------------| ---- |---------|--------------------------------------------|
| `dialogWidth`        | `String`           | 否 | `'50%'` | 新增/编辑弹窗的宽度。                                |
| `actionsColumnWidth` | `String \| Number` | 否 | `120`   | “操作”列的宽度。                                  |
| `dialogFormConfig`   | `FormItem[]`       | 否 | `[]`    | **弹窗表单配置**。用于动态生成表单，详细结构见下文 [数据结构](#4-数据结构)。 |
| `dialogFormRules`    | `Object`           | 否 | `{}`    | 弹窗表单的 `element-plus` 校验规则。                 |
| `dialogFullscreen`   | `Boole`            | 否 | `false` | 弹窗表单是否全屏展示。                                |
| `addDialogTitle`   | `String`           | 否 | `新增`    | 新增弹窗标题。                                    |
| `editDialogTitle`   | `String`            | 否 | `编辑`    | 修改弹窗标题。                                    |

### 分页配置

| Prop | 类型 | 必需 | 默认值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `pageSizes` | `Array` | 否 | `[10, 20, 50, 100]` | 每页显示条目数选项。 |
| `paginationLayout` | `String` | 否 | `'total, sizes, prev, pager, next, jumper'` | 分页组件布局。 |
| `paginationBackground` | `Boolean` | 否 | `true` | 是否为分页按钮添加背景色。 |
| `paginationSmall` | `Boolean` | 否 | `false` | 是否使用小型分页。 |
| `paginationHideOnSinglePage` | `Boolean` | 否 | `false` | 只有一页时是否隐藏分页。 |

### 样式与加载

| Prop | 类型 | 必需 | 默认值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `theme` | `'default' \| 'large-screen'` | 否 | `'default'` | 组件的主题风格，会影响弹窗样式。 |
| `customClass` | `String` | 否 | `''` | 应用于组件根元素的自定义类名。 |
| `loadingText` | `String` | 否 | `'加载中…'` | 表格加载时的提示文字。 |
| `loadingBackground` | `String` | 否 | `'rgba(0, 0, 0, 0.3)'` | 表格加载时的遮罩背景色。 |

### 生命周期钩子 (Hooks)

| Prop | 类型 | 描述 |
| ---- | ---- | ---- |
| `onBeforeQuery` | `(params) => Promise<any> \| any` | 发起列表查询前调用。允许修改`params`。 |
| `onAfterQuery` | `(data, params) => Promise<any[] \| any[]` | 列表数据请求成功后、渲染表格前调用。允许修改`data`。 |
| `onBeforeOpenDialog` | `(mode, data) => Promise<any> \| any` | 打开弹窗前调用。允许修改表单的初始`data`。 |
| `onAfterOpenDialog` | `(mode, data) => void` | 打开弹窗后调用（编辑模式下在详情请求后）。 |
| `onBeforeSubmit` | `(data, mode) => Promise<any> \| any` | 提交表单（校验通过后）前调用。允许修改提交的`data`。 |
| `onAfterSubmit` | `(mode, data) => void` | 表单提交成功后调用。 |
| `onBeforeDelete` | `(ids, rows) => Promise<boolean> \| boolean` | 执行删除操作前调用。返回 `false` 可中止删除。 |
| `onAfterDelete` | `(ids, rows) => void` | 删除成功后调用。 |

### Events (自定义事件)

| 事件名 | 回调参数 | 描述 |
| ---- | ---- | ---- |
| `open-dialog` | `{ mode: 'add' \| 'edit', data: any }` | 弹窗打开后触发。 |
| `submit` | `{ mode: 'add' \| 'edit', data: any }` | 新增或编辑提交成功后触发。 |
| `delete` | `ids: number[]` | 删除成功后触发。 |

### Exposed Methods (暴露方法)

| 方法名 | 参数                                                   | 描述                           |
| ---- |------------------------------------------------------|------------------------------|
| `refresh()` | -                                                    | 手动刷新表格数据（使用当前 `searchForm`）。 |
| `search()` | `(ids: number[])`                                                    | 手动触发表格搜索（重置 `pageNum` 到 1）。  |
| `handleDelete` | `(ids: number[])`                                    | 手动触发删除操作。                    |
| `openDialog` | `(mode: 'add' \| 'edit', dataPayload?: any)`         | 手动打开新增或编辑弹窗。                 |
| `submit` | `(mode: 'add' \| 'edit', data: Record<string, any>)` | 手动触发提交逻辑。                    |
| `closeDialog` | -                                                    | [新增] 手动触发提交关闭弹窗。             |

### 搜索区插槽

| Slot 名称 | 作用域 (Scope) | 描述 |
| ---- | ---- | ---- |
| `header` | - | 位于搜索区最顶部，`el-form` 之前。 |
| `query-conditions` | `{ searchForm: any }` | 搜索表单项的插入位置。 |
| `query-left` | `{ searchForm: any }` | 位于“搜索”按钮左侧。 |
| `query-right` | `{ searchForm: any }` | 位于“清空”按钮右侧。 |

### 操作区插槽

| Slot 名称 | 作用域 (Scope) | 描述 |
| ---- | ---- | ---- |
| `action-left` | `{ selections: any[] }` | 位于“新增”按钮左侧。 |
| `add-button-content` | `{ selections: any[] }` | 用于完全替换“新增”按钮。 |
| `action-right` | `{ selections: any[] }` | 位于“新增”按钮右侧。 |

### 表格区插槽

| Slot 名称 | 作用域 (Scope)    | 描述                                                   |
| ---- |----------------|------------------------------------------------------|
| `[column.slot]` | `{ row: any }` | **动态单元格插槽**。当 `columns` 配置项中提供了 `slot` 属性时，会以此名称渲染插槽。 |
| `actions` | `{ row: any }` | 完全替换默认的“编辑/删除”按钮组。                                   |
| `action-before-edit` | `{ row: any }` | 位于“编辑”按钮之前。                                          |
| `action-after-delete` | `{ row: any }` | 位于“删除”按钮之后。                                          |
| `dialog-form` | `{ row: any }` | 弹窗表单插槽                                               |
| `dialog-footer` | -              | 弹窗表单页脚插槽                                             |

### `Column` (用于 `columns` Prop)

| 键 | 类型 | 必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `prop` | `String` | 是 | "对应 `tableData` 中行的字段名。" |
| `label` | `String` | 是 | 列标题。 |
| `width` | `String \| Number` | 否 | 列宽度。 |
| `sortable` | `Boolean` | 否 | 是否可排序，默认为 `false`。 |
| `slot` | `String` | 否 | 自定义单元格渲染的插槽名称。 |
| `headerTooltip` | `Boolean` | 否 | 标题过长时是否显示 Tooltip（依赖 `TableHeaderWithTooltip.vue`）。 |
| `placement` | `String` | 否 | Tooltip 显示位置 (当 `headerTooltip` 为 `true` 时有效)。 |
| `attrs` | `Object` | 否 | 透传给 `el-table-column` 的其他属性 (如 `fixed`, `align` 等)。 |

### `FormItem` (用于 `dialogFormConfig` Prop)

| 键 | 类型 | 必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `prop` | `String` | 是 | 表单字段名，对应 `v-model`。 |
| `label` | `String` | 是 | 表单项标签。 |
| `type` | `String` | 是 | "表单项类型。支持: `'input'`, `'textarea'`, `'select'`, `'radio-group'`, `'input-disabled'`。" |
| `options` | `Array<{ label, value }>` | 否 | 适用于 `select` 和 `radio-group` 的选项数组。 |
| `componentProps` | `Object` | 否 | 透传给内部 `el-` 组件的属性 (如 `placeholder`, `rows`, `clearable` 等)。 |