<script setup lang="ts">
/**
 * addNeedNew — Stub component for filling "破冰课授课要求"
 * Referenced by schooltimetable/cards.vue.
 * Full implementation will come in Phase 4.3 (paperchedule).
 */
defineProps<{
  isShow: boolean
  hasPermision?: boolean
  deadline?: string
  orderObj?: Record<string, any>
}>()

const emit = defineEmits<{
  closeModal: []
}>()
</script>

<template>
  <el-dialog
    :model-value="isShow"
    title="授课要求"
    width="600px"
    :before-close="() => emit('closeModal')"
  >
    <div style="text-align: center; padding: 40px; color: #999">
      授课要求填写 — 完整实现将在论文规划表模块中完成
    </div>
    <template #footer>
      <el-button @click="emit('closeModal')">关闭</el-button>
    </template>
  </el-dialog>
</template>
