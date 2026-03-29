<script setup lang="ts">
import { ElNotification } from 'element-plus'

interface FileItem {
  name: string
  url: string
  loading?: boolean
}

const props = withDefaults(defineProps<{
  fileList: FileItem[]
  filesName?: string
  disabled?: boolean
  type?: string
  formName?: string
}>(), {
  fileList: () => [],
  filesName: '',
  disabled: false,
  type: '1',
  formName: 'form',
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'delete', index: number): void
}>()

function deleteFile(_item: FileItem, index: number) {
  if (props.fileList.length === 1) {
    ElNotification.warning('至少保留一个文件')
    return
  }
  emit('delete', index)
}

function seeFile(item: FileItem) {
  const previewExts = ['.txt', '.pdf', '.jpg', '.png', '.jpeg']
  const canPreview = previewExts.some(ext => item.name.indexOf(ext) > -1 || item.url.indexOf(ext) > -1)
  if (canPreview) {
    window.open(item.url)
  } else {
    window.open(item.url, '_self')
  }
}
</script>

<template>
  <div>
    <template v-if="fileList.length">
      <div
        v-for="(item, index) in fileList"
        :key="index"
        class="item"
      >
        <span class="file-name" @click="seeFile(item)">{{ item.name }}</span>
        <i
          v-if="!disabled"
          v-loading="item.loading"
          class="el-icon-delete delete-icon"
          @click="deleteFile(item, index)"
        ></i>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-loading-spinner .circular) {
  width: 20px;
  height: 20px;
  margin-top: 0 !important;
}
:deep(.el-loading-spinner) {
  top: 100%;
}
.item {
  width: 355px;
}
.file-name {
  line-height: 25px;
  cursor: pointer;
  display: inline-block;
  width: 85%;
  color: #3496fb;
}
.delete-icon {
  color: #3496fb;
  font-size: 20px;
  margin-left: 20px;
  cursor: pointer;
}
</style>
