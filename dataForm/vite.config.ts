import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({ // 用于自动生成 TypeScript 类型声明文件
      outDir: 'dist',
      tsconfigPath: './tsconfig.json'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  commonjsOptions: {
    esmExternals: true
  },
  build: {
    // 打包输出的目录
    outDir: 'dist',
    // 关键：配置为库模式
    lib: {
      // 库的入口文件，必须是 src/index.ts
      entry: resolve(__dirname, 'src/index.ts'),
      // UMD 模式下库暴露的全局变量名
      name: 'ZCrudTable',
      // 构建后输出的文件名
      fileName: 'z-crud-table'
    },
    // Rollup 的高级配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'element-plus', 'axios'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          axios: 'axios'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.111.127.220/api',
        // target: 'http://10.111.128.136:9202/', // 周超
        // target: 'http://10.111.128.130:8081', //李聪
        changeOrigin: true,
        ws: true,
        hotOnly: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
})
