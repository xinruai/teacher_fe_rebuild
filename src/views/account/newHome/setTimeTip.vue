<script setup lang="ts">
import { ref } from 'vue'

// TODO: Full migration in Phase 5 (account views)
const isShow = ref(false)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

defineExpose({ show, closeModal })
</script>

<template>
  <el-dialog v-model="isShow" title="设置可接单时间" width="500px" :close-on-click-modal="false">
    <div style="padding: 20px; text-align: center;">设置可接单时间 — stub (Phase 5)</div>
    <template #footer>
      <el-button @click="closeModal">关闭</el-button>
    </template>
  </el-dialog>
</template>
