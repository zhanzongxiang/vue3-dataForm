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

            <el-upload
                v-if="item.type === 'upload'"
                v-bind="item.componentProps"
                :http-request="(options) => handleHttpRequest(options, item)"
                :on-remove="(file, uploadFiles) => handleRemove(file, uploadFiles, item)"
            >
              <el-icon v-if="item.componentProps?.listType === 'picture-card' || item.componentProps?.['list-type'] === 'picture-card'">
                <Plus />
              </el-icon>

              <el-button v-else type="primary" plain>
                <el-icon style="margin-right: 4px"><Upload /></el-icon>点击上传
              </el-button>

              <template #tip v-if="item.componentProps?.tip">
                <div class="el-upload__tip" style="color: #909399; margin-top: 4px; line-height: 1.2;">
                  {{ item.componentProps.tip }}
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Upload } from '@element-plus/icons-vue';
import request from '@/utils/request';

const props = defineProps<{
  modelValue: Record<string, any>;
  formConfig: any[];
  rules?: Record<string, any>;
}>();

const formRef = ref<any>(null);

defineExpose({
  validate: () => formRef.value?.validate(),
});

// ================= 核心：接管上传与拦截 =================
const handleHttpRequest = async (options: any, item: any) => {
  const { file, action, onSuccess, onError, onProgress } = options;
  const isMultiple = item.componentProps?.multiple || (item.componentProps?.limit && item.componentProps.limit > 1);

  // 【策略 A：拦截模式】不发请求，单纯拦截文件流跟表单一起提交
  if (item.componentProps?.uploadStrategy === 'intercept') {
    // 1. 存入表单模型
    if (isMultiple) {
      const currentFiles = Array.isArray(props.modelValue[item.prop]) ? props.modelValue[item.prop] : [];
      props.modelValue[item.prop] = [...currentFiles, file];
    } else {
      props.modelValue[item.prop] = file;
    }
    // 2. 模拟上传成功骗过 el-upload（非常关键：这能让照片墙正常显示图片缩略图，并去掉加载 loading）
    onSuccess({ mock: true }, file);
    return;
  }

  // 【策略 B：真实上传模式】使用项目自带的 request 进行上传
  try {
    const formData = new FormData();
    formData.append(item.componentProps?.name || 'file', file);

    const res: any = await request.post(action, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e: any) => {
        if (e.total > 0) {
          e.percent = Math.round((e.loaded / e.total) * 100);
        }
        onProgress(e);
      }
    });
    // 1. 提取后端返回的路径 (⚠️根据你后端的实际情况调整，比如 res.data.url 或 res.data)
    const url = res.data.file;

    // 2. 存入表单模型
    if (isMultiple) {
      const currentUrls = props.modelValue[item.prop] ? props.modelValue[item.prop].split(',') : [];
      currentUrls.push(url);
      props.modelValue[item.prop] = currentUrls.join(',');
    } else {
      props.modelValue[item.prop] = url;
    }

    onSuccess(res, file);
  } catch (error) {
    onError(error);
  }
};

// ================= 处理移除文件 =================
const handleRemove = (file: any, uploadFiles: any[], item: any) => {
  const isMultiple = item.componentProps?.multiple || (item.componentProps?.limit && item.componentProps.limit > 1);

  if (item.componentProps?.uploadStrategy === 'intercept') {
    // 移除对应的文件流
    const rawFiles = uploadFiles.map(f => f.raw).filter(Boolean);
    props.modelValue[item.prop] = isMultiple ? rawFiles : (rawFiles[0] || null);
  } else {
    // 移除对应的 URL
    // 注意：拦截模式下的 response 我们塞了 mock: true，所以这里通过判断过滤
    const urls = uploadFiles.map(f => f.response?.mock ? null : (f.response?.data || f.response?.url || f.url)).filter(Boolean);
    props.modelValue[item.prop] = isMultiple ? urls.join(',') : (urls[0] || '');
  }

  if (item.componentProps?.onRemove) {
    item.componentProps.onRemove(file, uploadFiles);
  }
};
</script>