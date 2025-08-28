<template>
  <span v-if="!isOverflow" ref="textRef" class="header-cell-content">
    {{ label }}
  </span>
  <el-tooltip v-else :content="label" placement="top">
    <span ref="textRef" class="header-cell-content">
      {{ label }}
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// 引入 @vueuse/core 的 useResizeObserver 来监听元素尺寸变化
import { useResizeObserver } from '@vueuse/core';

// 接收父组件传来的表头标题
const props = defineProps<{
  label: string;
}>();

// 创建一个 ref 来引用 DOM 元素
const textRef = ref<HTMLElement | null>(null);
// 创建一个 ref 来存储是否溢出的状态
const isOverflow = ref(false);

// 定义一个函数来检查是否溢出
const checkOverflow = () => {
  if (textRef.value) {
    // 关键逻辑：当元素的滚动宽度 > 元素的可见宽度时，即为溢出
    isOverflow.value = textRef.value.scrollWidth > textRef.value.clientWidth;
  }
};

// 在组件挂载后，立即执行一次检查
onMounted(() => {
  checkOverflow();
});

// 使用 useResizeObserver 监听元素的尺寸变化
// 当浏览器窗口大小改变或列宽被拖动时，会自动重新检查
useResizeObserver(textRef, () => {
  checkOverflow();
});
</script>

<style scoped>
/* 确保 span 元素应用了文本溢出的基础样式 */
.header-cell-content {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>