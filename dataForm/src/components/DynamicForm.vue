<template>
  <el-form :model="modelValue" :rules="rules" ref="formRef" v-bind="$attrs">
    <el-row :gutter="20">
      <template v-for="item in formConfig" :key="item.prop">
        <el-col :span="item.span || 24">
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
                style="width: 100%"
            >
              <el-option
                  v-for="(option, index) in item.options"
                  :key="option[item.componentProps?.props?.value || 'value']"
                  :label="option[item.componentProps?.props?.label || 'label']"
                  :value="option[item.componentProps?.props?.value || 'value']"
              />
            </el-select>

            <el-date-picker
                v-if="item.type === 'date-picker'"
                v-model="modelValue[item.prop]"
                v-bind="item.componentProps"
                style="width: 100%"
            />

            <el-time-picker
                v-if="item.type === 'time-picker'"
                v-model="modelValue[item.prop]"
                v-bind="item.componentProps"
                style="width: 100%"
            />

            <el-radio-group
                v-if="item.type === 'radio-group'"
                v-model="modelValue[item.prop]"
                v-bind="item.componentProps"
            >
              <el-radio
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.value"
              >{{ option.label }}</el-radio>
            </el-radio-group>

            <el-input
                v-if="item.type === 'input-disabled'"
                :model-value="modelValue[item.prop]"
                disabled
                v-bind="item.componentProps"
            />
          </el-form-item>
        </el-col>
      </template>
    </el-row>
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