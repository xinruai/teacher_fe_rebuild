<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
import videoStep from '@/views/newTrain/components/videoStep.vue'
import { complateUploadIntroduce } from '@/api/modules/newTrain'
import { getTeacherInfo } from '@/api/modules/persondetail'

const isShow = ref(false)
const teacherInfo = ref<Record<string, any>>({})

function show() {
  isShow.value = true
  fetchTeacherInfo()
}

function handleClose() {
  isShow.value = false
}

async function fetchTeacherInfo() {
  const res = await getTeacherInfo()
  if (res.status == 200) {
    teacherInfo.value = res.body || {}
  }
}

async function confirmComplate() {
  const res = await complateUploadIntroduce()
  if (res.status == 200) {
    handleClose()
  }
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    title="个人介绍视频"
    v-model="isShow"
    width="900px"
    :before-close="handleClose"
    append-to-body
  >
    <videoStep :teacherInfo="teacherInfo" @refresh="fetchTeacherInfo" />
    <el-button
      :disabled="!teacherInfo.introduceVideo"
      class="complate-btn"
      @click="confirmComplate"
    >确认完成</el-button>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 15px;
}
:deep(.el-dialog__header) {
  padding: 50px 50px 0;
}
:deep(.el-dialog__title) {
  color: #303133;
  font-weight: 700;
}
:deep(.el-dialog__body) {
  padding: 30px 50px 50px;
}
:deep(.complate-btn) {
  width: 152px;
  height: 32px;
  border-radius: 30px;
  border: 1px solid #939393;
  display: block;
  margin: 70px auto 0;
  &:hover,
  &:active {
    background: none;
  }
  span {
    color: #939393;
    position: relative;
    top: -3px;
  }
}
:deep(.video-step) {
  margin-top: 70px;
}
:deep(.el-dialog__close) {
  font-size: 20px;
}
.complate-btn.is-disabled {
  background: #eee;
  color: #fff;
  border: none;
}
</style>
