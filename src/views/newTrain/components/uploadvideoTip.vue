<script setup lang="ts">
// TODO: Full implementation in Phase 5 (newTrain module)
// Stub: video upload tip modal used by tableContent in newSalary
import { ref } from 'vue'
import { ElDialog } from 'element-plus'

defineProps<{
  type?: string
}>()

const isShow = ref(false)

function show() {
  isShow.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="isShow" title="上传个人介绍视频" width="600px" append-to-body>
    <div>请上传个人介绍视频后再进行提现操作</div>
  </el-dialog>
</template>
