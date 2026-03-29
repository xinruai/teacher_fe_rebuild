<script setup lang="ts">
import { getFileExt } from '@/utils/index'
import DeTooltip from '@/components/DeTooltip/index.vue'

const props = withDefaults(defineProps<{
  fileList?: any[]
  required?: boolean
  showRequiredInput?: boolean
  groupName?: string
  form?: any
  showComplateProgress?: boolean
  deleteImmediately?: boolean
}>(), {
  fileList: () => [],
  required: false,
  showRequiredInput: true,
  groupName: 'syllabus',
  form: () => ({}),
  showComplateProgress: true,
  deleteImmediately: false,
})

const emit = defineEmits<{
  (e: 'deleteFile', item: any): void
}>()

const getIconUrl = (fileName: string) => {
  const ext = getFileExt(fileName)
  return new URL(`../../../assets/images/order/upload/${ext}.svg`, import.meta.url).href
}

const fileValidate = (fileInfo: any) => {
  return (_rule: any, value: any, callback: any) => {
    if (!value && props.required) {
      callback(new Error('文件描述为必填'))
    } else if (!fileInfo.percentage || fileInfo.percentage < 100) {
      callback(new Error('文件正在上传中'))
    } else {
      callback()
    }
  }
}

const deleteFile = (index: number, item: any) => {
  if (props.deleteImmediately) emit('deleteFile', { groupName: props.groupName, index, ...item })
  else props.form[props.groupName].splice(index, 1)
}

const downloadFile = (url: string) => {
  window.open(url)
}
</script>

<template>
  <div class="upload-file-list">
    <div
      class="upload-file-item"
      v-for="(item, index) in form[groupName]"
      :key="index"
    >
      <img :src="getIconUrl(item.name)" alt="" />
      <div class="upload-file-content">
        <DeTooltip :text="item.name" @click="downloadFile(item.url)" />
        <el-form-item
          label=" "
          :prop="`[${groupName}][${index}].description`"
          :rules="[{ required: required, validator: fileValidate(item), trigger: 'blur' }]"
          v-if="showRequiredInput"
        >
          <el-input v-model="form[groupName][index].description" />
        </el-form-item>
        <el-progress
          :percentage="form[groupName][index].percentage || 0"
          v-if="showComplateProgress || (form[groupName][index].percentage > 0 && form[groupName][index].percentage < 100)"
        />
      </div>
      <i
        v-if="!(deleteImmediately && !item.id)"
        class="el-icon-delete"
        @click="deleteFile(index, item)"
      ></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-file-list {
  padding: 4px 2px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  .upload-file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
      width: 28px;
      height: auto;
    }
    .el-icon-delete {
      color: #3d3d3d;
      font-size: 20px;
    }
    .upload-file-content {
      flex: 1;
      overflow: auto;
      margin: 0 4px;
      display: flex;
      flex-direction: column;
      height: 40px;
      justify-content: center;
      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #3d3d3d;
        font-size: 14px;
        line-height: 22px;
        font-weight: 600;
        margin: 0;
      }
    }
  }
}
.el-form-item {
  width: 100%;
  margin-bottom: 8px !important;
  display: flex;
}
:deep(.el-form-item__content) {
  flex: 1;
}
</style>
