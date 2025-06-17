<template>
  <el-form :model="modelValue" :rules="rules" ref="formRef" v-bind="$attrs">
    <template v-for="item in formConfig" :key="item.prop">
      <el-form-item :label="item.label" :prop="item.prop">
        <el-input
            v-if="item.type === 'input'"
            v-model="modelValue[item.prop]"
            v-bind="item.componentProps"
        />
        <el-input
            v-if="item.type === 'textarea'"
            type="textarea"
            v-model="modelValue[item.prop]"
            v-bind="item.componentProps"
        />
        <el-select
            v-if="item.type === 'select'"
            v-model="modelValue[item.prop]"
            v-bind="item.componentProps"
        >
          <el-option
              v-for="option in item.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
        <el-radio-group
            v-if="item.type === 'radio-group'"
            v-model="modelValue[item.prop]"
            v-bind="item.componentProps"
        >
          <el-radio
              v-for="option in item.options"
              :key="option.value"
              :label="option.value"
          >{{ option.label }}</el-radio
          >
        </el-radio-group>
        <el-input
            v-if="item.type === 'input-disabled'"
            :model-value="modelValue[item.prop]"
            disabled
            v-bind="item.componentProps"
        />
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  modelValue: Record<string, any>;
  formConfig: any[];
  rules?: Record<string, any>;
}>();

const formRef = ref<any>(null);

defineExpose({
  validate: () => formRef.value?.validate(),
});
</script>