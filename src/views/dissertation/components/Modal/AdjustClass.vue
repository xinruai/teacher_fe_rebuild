<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

function show() {
  visible.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="visible" title="提示" width="500px">
    <p>请根据学生需求调整相应上课的阶段顺序</p>
    <template #footer>
      <el-button type="primary" @click="visible = false">我知道了</el-button>
    </template>
  </el-dialog>
</template>
