import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

// 全局注册 Element Plus 并设置中文
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')