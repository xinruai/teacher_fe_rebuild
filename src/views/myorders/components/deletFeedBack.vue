<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'deleteFile', current: any): void
}>()

const isShow = ref(false)
const current = ref<any>({})

const show = (row: any) => {
  isShow.value = true
  current.value = row
}

const closeModal = () => {
  isShow.value = false
}

defineExpose({ show, closeModal })
</script>

<template>
  <el-dialog
    title="【课程反馈】删除"
    v-model="isShow"
    :before-close="closeModal"
    :append-to-body="true"
    width="320px"
  >
    <div class="content">确定删除当前任务反馈吗？</div>
    <div class="footer">
      <el-button type="primary" plain size="small" @click="closeModal">取消</el-button>
      <el-button type="danger" plain size="small" @click="emit('deleteFile', current)">删除</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.content {
  text-align: center;
  margin: 30px;
}
.footer {
  text-align: center;
  padding-bottom: 20px;
}
:deep(.el-button) {
  background: transparent;
  &:hover,
  &:active,
  &:focus {
    background: transparent;
  }
  span {
    color: #f56c6c;
  }
}
:deep(.el-button--primary.is-plain) {
  span {
    color: #409eff;
  }
}
</style>
