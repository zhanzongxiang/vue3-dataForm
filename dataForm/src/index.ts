import type { App } from 'vue';
import CrudTable from './components/CrudTable.vue';

// 关键：导入组件库所需的所有样式
import './assets/main.css';

// 按需导出核心组件
export {
    CrudTable
};

// 支持以 Vue 插件形式全局安装 (app.use)
// export default {
//     install: (app: App) => {
//         app.component('CrudTable', CrudTable);
//     }
// };
