<script setup lang="ts">
// TODO: Full implementation in Phase 5 (account module)
// Stub: provides file upload functionality used by appealList
import { ref } from 'vue'
import { ElUpload, ElButton } from 'element-plus'
import { BasicUrl } from '@/api/config'
import { getToken } from '@/utils/auth'

const emit = defineEmits<{
  uploadFiles: [file: { name: string; url: string }]
}>()

function handleSuccess(response: any, file: any) {
  if (response.code === 20000) {
    emit('uploadFiles', {
      name: file.name,
      url: response.body || response.data,
    })
  }
}
</script>

<template>
  <div class="upload-file">
    <el-upload
      :action="`${BasicUrl}/file/upload`"
      :headers="{ 'X-Token': getToken() || '' }"
      :show-file-list="false"
      :on-success="handleSuccess"
    >
      <slot name="uploadBtn">
        <el-button size="small" type="primary">上传文件</el-button>
      </slot>
    </el-upload>
  </div>
</template>
